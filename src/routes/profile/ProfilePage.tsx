import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/emailValidation';
import { filiereService } from '../../services/api/filiereService';
import {
    User,
    Mail,
    GraduationCap,
    Shield,
    Save,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Key,
    Calendar
} from 'lucide-react';

interface Filiere {
    id: string;
    name: string;
    code: string | null;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, updateProfile } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [filiereId, setFiliereId] = useState<string>('');

    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/modules');
        }
    }, [isLoading, isAuthenticated, navigate]);

    // Populate current user data
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
            setFiliereId(user.filiereId || '');
        }
    }, [user]);

    // Fetch Filieres list
    useEffect(() => {
        const fetchFilieres = async () => {
            try {
                const data = await filiereService.getAll();
                setFilieres(data);
            } catch (err) {
                console.error('Erreur chargement filières:', err);
            }
        };

        fetchFilieres();
    }, []);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-[#F6F5F0] flex items-center justify-center p-4">
                <p className="text-[#8E8A83] font-medium text-sm">Chargement du profil...</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!firstName.trim() || !lastName.trim()) {
            setError('Veuillez renseigner votre prénom et nom.');
            return;
        }

        const emailCheck = validateEmail(email);
        if (!emailCheck.isValid) {
            setError(emailCheck.error || 'Adresse email invalide.');
            return;
        }

        try {
            setSaving(true);
            await updateProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                filiereId: filiereId || null
            });

            setSuccessMessage('Votre profil a été mis à jour avec succès !');
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erreur lors de la mise à jour du profil.');
            }
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (fn: string, ln: string) => {
        return `${fn ? fn.charAt(0).toUpperCase() : ''}${ln ? ln.charAt(0).toUpperCase() : ''}` || 'E';
    };

    const currentFiliere = filieres.find(f => f.id === (filiereId || user.filiereId));

    return (
        <div className="min-h-screen bg-[#F6F5F0] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Back Link */}
                <div>
                    <button
                        onClick={() => navigate('/modules')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#8E8A83] hover:text-[#12100E] transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#E5E3D8] shadow-2xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour aux modules</span>
                    </button>
                </div>

                {/* Profile Overview Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3D8] shadow-sm relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-[#E05320] text-white flex items-center justify-center font-syne font-extrabold text-2xl shadow-md flex-shrink-0">
                            {getInitials(user.firstName, user.lastName)}
                        </div>

                        {/* User Details Header */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                <h1 className="font-syne font-extrabold text-2xl text-[#12100E]">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                    user.role === 'ADMIN'
                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                        : user.role === 'DELEGATE'
                                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                        : 'bg-[#FDF0EB] text-[#E05320] border border-[#E05320]/20'
                                }`}>
                                    <Shield className="w-3 h-3 inline mr-1" />
                                    {user.role}
                                </span>
                            </div>

                            <p className="text-xs font-medium text-[#8E8A83] mb-3 flex items-center justify-center sm:justify-start gap-1.5">
                                <Mail className="w-3.5 h-3.5" />
                                <span>{user.email}</span>
                            </p>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#524E48]">
                                {currentFiliere && (
                                    <span className="flex items-center gap-1 bg-[#F7F6F0] px-3 py-1 rounded-lg border border-[#E5E3D8]">
                                        <GraduationCap className="w-3.5 h-3.5 text-[#E05320]" />
                                        <span>{currentFiliere.name}</span>
                                    </span>
                                )}

                                {user.createdAt && (
                                    <span className="flex items-center gap-1 text-[#8E8A83]">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Edit Form Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3D8] shadow-sm">
                    <div className="border-b border-[#E5E3D8] pb-4 mb-6">
                        <h2 className="font-syne font-extrabold text-xl text-[#12100E]">
                            Modifier mes informations
                        </h2>
                        <p className="text-xs text-[#8E8A83] mt-1">
                            Mettez à jour vos données personnelles et votre affiliation académique
                        </p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-medium flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#12100E] mb-1.5">
                                    Prénom
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E8A83]" />
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E3D8] text-xs text-[#12100E] focus:outline-none focus:border-[#E05320] focus:ring-2 focus:ring-[#E05320]/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#12100E] mb-1.5">
                                    Nom
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E8A83]" />
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E3D8] text-xs text-[#12100E] focus:outline-none focus:border-[#E05320] focus:ring-2 focus:ring-[#E05320]/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#12100E] mb-1.5">
                                Email institutionnel (vérifié)
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E8A83]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E3D8] text-xs text-[#12100E] focus:outline-none focus:border-[#E05320] focus:ring-2 focus:ring-[#E05320]/20 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#12100E] mb-1.5">
                                Filière d'études
                            </label>
                            <div className="relative">
                                <GraduationCap className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E8A83]" />
                                <select
                                    value={filiereId}
                                    onChange={(e) => setFiliereId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E3D8] text-xs text-[#12100E] bg-white focus:outline-none focus:border-[#E05320] focus:ring-2 focus:ring-[#E05320]/20 transition-all cursor-pointer"
                                >
                                    <option value="">Sélectionner une filière</option>
                                    {filieres.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} {f.code ? `(${f.code})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 bg-[#E05320] hover:bg-[#C94518] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security info card */}
                <div className="bg-[#FAF9F5] border border-[#E5E3D8] rounded-2xl p-4 flex items-center justify-between text-xs text-[#8E8A83]">
                    <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#E05320]" />
                        <span>Compte protégé par authentification sécurisée JWT</span>
                    </div>
                    <span className="font-extrabold text-[#12100E]">EST Casa</span>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
