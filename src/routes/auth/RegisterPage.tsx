import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSelection } from '../../context/SelectionContext';
import { filiereService } from '../../services/api/filiereService';
import { UserPlus, ArrowLeft, AlertCircle, CheckCircle, Lock, Mail, User, GraduationCap } from 'lucide-react';

interface Filiere {
    id: string;
    name: string;
    code: string | null;
}

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();
    const { selection } = useSelection();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [filiereId, setFiliereId] = useState<string>(selection?.filiere || '');

    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/modules');
        }
    }, [isAuthenticated, navigate]);

    // Fetch Filieres for dropdown
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!firstName.trim() || !lastName.trim()) {
            setError('Veuillez saisir votre prénom et nom.');
            return;
        }

        if (!email.trim() || !email.includes('@')) {
            setError('Veuillez saisir une adresse email valide.');
            return;
        }

        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        try {
            setLoading(true);
            await register({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                password,
                filiereId: filiereId || undefined
            });

            setSuccessMessage('Compte créé avec succès ! Redirection en cours...');
            setTimeout(() => {
                navigate('/modules');
            }, 1000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Une erreur est survenue lors de l'inscription.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F5F0] flex items-center justify-center p-4 py-12">
            <div className="max-w-md w-full">
                {/* Top Link */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#8E8A83] hover:text-[#12100E] transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour à l'accueil</span>
                    </button>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3D8] shadow-lg">
                    {/* Header Logo & Title */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-[#E05320] rounded-2xl flex items-center justify-center text-white font-syne font-extrabold text-xl mx-auto mb-4 shadow-md">
                            E
                        </div>
                        <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-[#12100E]">
                            Créer un compte étudiant
                        </h1>
                        <p className="text-xs font-medium text-[#8E8A83] mt-1.5">
                            Rejoignez la plateforme des étudiants de l'EST Casa
                        </p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-[#12100E] mb-1.5">
                                    Prénom
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E8A83]" />
                                    <input
                                        type="text"
                                        placeholder="Hamza"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E5E3D8] text-xs text-[#12100E] placeholder:text-slate-400 focus:outline-none focus:border-[#E05320] focus:ring-2 focus:ring-[#E05320]/20 transition-all"
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
                                        placeholder="Alaoui"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E5E3D8] text-xs text-[#12100E] placeholder:text-slate-400 focus:outline-none focus:border-[#E05320] focus:ring-2 focus:ring-[#E05320]/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#12100E] mb-1.5">
                                Email institutionnel
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E8A83]" />
                                <input
                                    type="email"
                                    placeholder="hamza.alaoui@est-casa.ma"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E3D8] text-xs text-[#12100E] placeholder:text-slate-400 focus:outline-none focus:border-[#E05320] focus:ring-2 focus:ring-[#E05320]/20 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#12100E] mb-1.5">
                                Mot de passe (min 8 caractères)
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E8A83]" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E3D8] text-xs text-[#12100E] placeholder:text-slate-400 focus:outline-none focus:border-[#E05320] focus:ring-2 focus:ring-[#E05320]/20 transition-all"
                                />
                            </div>
                        </div>

                        {filieres.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-[#12100E] mb-1.5">
                                    Filière d'études (Facultatif)
                                </label>
                                <div className="relative">
                                    <GraduationCap className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8E8A83]" />
                                    <select
                                        value={filiereId}
                                        onChange={(e) => setFiliereId(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E3D8] text-xs text-[#12100E] bg-white focus:outline-none focus:border-[#E05320] focus:ring-2 focus:ring-[#E05320]/20 transition-all cursor-pointer"
                                    >
                                        <option value="">Sélectionner votre filière</option>
                                        {filieres.map(f => (
                                            <option key={f.id} value={f.id}>
                                                {f.name} {f.code ? `(${f.code})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3 bg-[#E05320] hover:bg-[#C94518] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span>Création du compte...</span>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    <span>S'inscrire</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-[#8E8A83]">
                        Vous avez déjà un compte ?{' '}
                        <Link to="/modules" onClick={() => navigate('/modules')} className="font-bold text-[#E05320] hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
