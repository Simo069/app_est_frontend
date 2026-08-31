import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    GraduationCap,
    BookOpen,
    FolderKanban,
    FileText,
    Users,
    Plus,
    Trash2,
    Edit3,
    Upload,
    CheckCircle,
    AlertCircle,
    Shield,
    X
} from 'lucide-react';

interface Niveau {
    id: string;
    name: string;
    order: number;
}

interface Filiere {
    id: string;
    name: string;
    code: string | null;
    niveauId: string;
    niveau?: Niveau;
}

interface Semestre {
    id: string;
    name: string;
    order: number;
    filiereId: string;
}

interface ModuleItem {
    id: string;
    name: string;
    code: string | null;
    semestreId: string;
    semestre?: Semestre;
}

interface UserItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'STUDENT' | 'DELEGATE' | 'ADMIN';
    filiereId?: string | null;
}

const API_URL = 'http://localhost:3000/api';

type TabType = 'overview' | 'niveaux' | 'filieres' | 'modules' | 'ressources' | 'users';

const AdminDashboard: React.FC = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Data lists
    const [niveaux, setNiveaux] = useState<Niveau[]>([]);
    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [semestres, setSemestres] = useState<Semestre[]>([]);
    const [modules, setModules] = useState<ModuleItem[]>([]);
    const [users, setUsers] = useState<UserItem[]>([]);

    // Loading & Error Feedback
    const [, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Modal forms states
    const [isNiveauModalOpen, setIsNiveauModalOpen] = useState(false);
    const [niveauName, setNiveauName] = useState('');
    const [niveauOrder, setNiveauOrder] = useState<number>(1);
    const [editingNiveauId, setEditingNiveauId] = useState<string | null>(null);

    const [isFiliereModalOpen, setIsFiliereModalOpen] = useState(false);
    const [filiereName, setFiliereName] = useState('');
    const [filiereCode, setFiliereCode] = useState('');
    const [filiereNiveauId, setFiliereNiveauId] = useState('');
    const [editingFiliereId, setEditingFiliereId] = useState<string | null>(null);

    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [moduleName, setModuleName] = useState('');
    const [moduleCode, setModuleCode] = useState('');
    const [moduleSemestreId, setModuleSemestreId] = useState('');
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

    // Upload resource form
    const [resTitle, setResTitle] = useState('');
    const [resType, setResType] = useState<'COURSE' | 'TD' | 'TP'>('COURSE');
    const [resModuleId, setResModuleId] = useState('');
    const [resFile, setResFile] = useState<File | null>(null);

    // Headers with Auth Token
    const getHeaders = () => ({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    // 1. Fetch All Data
    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [resNiveaux, resFilieres, resSemestres, resModules, resUsers] = await Promise.all([
                fetch(`${API_URL}/niveau`),
                fetch(`${API_URL}/filiere`),
                fetch(`${API_URL}/semestre`),
                fetch(`${API_URL}/modules`),
                fetch(`${API_URL}/users`, { headers: getHeaders() })
            ]);

            if (resNiveaux.ok) setNiveaux(await resNiveaux.json());
            if (resFilieres.ok) setFilieres(await resFilieres.json());
            if (resSemestres.ok) setSemestres(await resSemestres.json());
            if (resModules.ok) setModules(await resModules.json());
            if (resUsers.ok) setUsers(await resUsers.json());
        } catch (err) {
            console.error('Erreur chargement données admin:', err);
            setError('Impossible de charger les données du serveur.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [token]);

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // ==========================================
    // 1. GESTION DES NIVEAUX
    // ==========================================
    const handleSaveNiveau = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingNiveauId ? 'PATCH' : 'POST';
            const url = editingNiveauId ? `${API_URL}/niveau/${editingNiveauId}` : `${API_URL}/niveau`;

            const res = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify({ name: niveauName, order: Number(niveauOrder) })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Erreur lors de la sauvegarde du niveau');
            }

            showSuccess(editingNiveauId ? 'Niveau modifié avec succès' : 'Niveau ajouté avec succès');
            setIsNiveauModalOpen(false);
            setNiveauName('');
            setEditingNiveauId(null);
            fetchAllData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur sauvegarde niveau');
        }
    };

    const handleDeleteNiveau = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce niveau ?')) return;
        try {
            const res = await fetch(`${API_URL}/niveau/${id}`, { method: 'DELETE', headers: getHeaders() });
            if (!res.ok) throw new Error('Impossible de supprimer ce niveau');
            showSuccess('Niveau supprimé');
            fetchAllData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur suppression niveau');
        }
    };

    // ==========================================
    // 2. GESTION DES FILIERES
    // ==========================================
    const handleSaveFiliere = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingFiliereId ? 'PATCH' : 'POST';
            const url = editingFiliereId ? `${API_URL}/filiere/${editingFiliereId}` : `${API_URL}/filiere`;

            const res = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify({
                    name: filiereName,
                    code: filiereCode || null,
                    niveauId: filiereNiveauId
                })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Erreur sauvegarde filière');
            }

            showSuccess(editingFiliereId ? 'Filière modifiée' : 'Filière ajoutée');
            setIsFiliereModalOpen(false);
            setFiliereName('');
            setFiliereCode('');
            setEditingFiliereId(null);
            fetchAllData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur sauvegarde filière');
        }
    };

    const handleDeleteFiliere = async (id: string) => {
        if (!confirm('Supprimer cette filière ?')) return;
        try {
            const res = await fetch(`${API_URL}/filiere/${id}`, { method: 'DELETE', headers: getHeaders() });
            if (!res.ok) throw new Error('Impossible de supprimer cette filière');
            showSuccess('Filière supprimée');
            fetchAllData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur suppression filière');
        }
    };

    // ==========================================
    // 3. GESTION DES MODULES
    // ==========================================
    const handleSaveModule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingModuleId ? 'PATCH' : 'POST';
            const url = editingModuleId ? `${API_URL}/modules/${editingModuleId}` : `${API_URL}/modules`;

            const res = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify({
                    name: moduleName,
                    code: moduleCode || null,
                    semestreId: moduleSemestreId
                })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Erreur sauvegarde module');
            }

            showSuccess(editingModuleId ? 'Module modifié' : 'Module créé');
            setIsModuleModalOpen(false);
            setModuleName('');
            setModuleCode('');
            setEditingModuleId(null);
            fetchAllData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur sauvegarde module');
        }
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm('Supprimer ce module ?')) return;
        try {
            const res = await fetch(`${API_URL}/modules/${id}`, { method: 'DELETE', headers: getHeaders() });
            if (!res.ok) throw new Error('Impossible de supprimer ce module');
            showSuccess('Module supprimé');
            fetchAllData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur suppression module');
        }
    };

    // ==========================================
    // 4. UPLOAD DE RESSOURCE
    // ==========================================
    const handleUploadRessource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resFile || !resTitle || !resModuleId) {
            setError('Veuillez remplir tous les champs et choisir un fichier.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', resFile);
            formData.append('title', resTitle);
            formData.append('type', resType);
            formData.append('moduleId', resModuleId);

            const res = await fetch(`${API_URL}/ressources/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Erreur lors du téléversement de la ressource");
            }

            showSuccess('Ressource téléversée avec succès dans MinIO / DB !');
            setResTitle('');
            setResFile(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur uploader ressource');
        }
    };

    // ==========================================
    // 5. GESTION DES UTILISATEURS & ROLES
    // ==========================================
    const handleChangeRole = async (userId: string, newRole: 'STUDENT' | 'DELEGATE' | 'ADMIN') => {
        try {
            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ role: newRole })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Erreur modification rôle');
            }

            showSuccess('Rôle utilisateur mis à jour');
            fetchAllData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur rôle');
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F5F0] text-[#12100E]">
            {/* Header Admin Banner */}
            <div className="bg-[#101726] text-white border-b border-slate-800 px-4 sm:px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#E05320] text-white flex items-center justify-center font-syne font-extrabold text-xl shadow-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-syne font-extrabold text-2xl text-white">Dashboard Administrateur</h1>
                                <span className="bg-[#E05320] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                                    ADMIN
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Gérer les niveaux, filières, modules, ressources et droits d'accès
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={fetchAllData}
                        className="self-start md:self-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                        🔄 Rafraîchir les données
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-[#E5E3D8] px-4 sm:px-8 sticky top-16 z-30 shadow-2xs">
                <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 text-xs font-bold">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'overview' ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Vue d'ensemble</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('niveaux')}
                        className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'niveaux' ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Niveaux ({niveaux.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('filieres')}
                        className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'filieres' ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Filières ({filieres.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('modules')}
                        className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'modules' ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <FolderKanban className="w-4 h-4" />
                        <span>Modules ({modules.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('ressources')}
                        className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'ressources' ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Ressources</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'users' ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Utilisateurs ({users.length})</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Notifications */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-500 font-bold">✕</button>
                    </div>
                )}

                {successMessage && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 shadow-xs">
                                <div className="text-[#8E8A83] text-xs font-bold uppercase tracking-wider mb-2">Niveaux</div>
                                <div className="font-syne font-extrabold text-3xl text-[#12100E]">{niveaux.length}</div>
                            </div>

                            <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 shadow-xs">
                                <div className="text-[#8E8A83] text-xs font-bold uppercase tracking-wider mb-2">Filières</div>
                                <div className="font-syne font-extrabold text-3xl text-[#12100E]">{filieres.length}</div>
                            </div>

                            <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 shadow-xs">
                                <div className="text-[#8E8A83] text-xs font-bold uppercase tracking-wider mb-2">Modules</div>
                                <div className="font-syne font-extrabold text-3xl text-[#12100E]">{modules.length}</div>
                            </div>

                            <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 shadow-xs">
                                <div className="text-[#8E8A83] text-xs font-bold uppercase tracking-wider mb-2">Utilisateurs</div>
                                <div className="font-syne font-extrabold text-3xl text-[#E05320]">{users.length}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: NIVEAUX */}
                {activeTab === 'niveaux' && (
                    <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-syne font-extrabold text-xl text-[#12100E]">Gestion des Niveaux</h2>
                                <p className="text-xs text-[#8E8A83] mt-1">Créez et organisez les années d'études</p>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingNiveauId(null);
                                    setNiveauName('');
                                    setNiveauOrder(niveaux.length + 1);
                                    setIsNiveauModalOpen(true);
                                }}
                                className="px-4 py-2.5 bg-[#E05320] hover:bg-[#C94518] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Ajouter un Niveau</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#E5E3D8] text-[#8E8A83] uppercase tracking-wider">
                                        <th className="py-3 px-4">Ordre</th>
                                        <th className="py-3 px-4">Nom du Niveau</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0EEE6]">
                                    {niveaux.map(n => (
                                        <tr key={n.id} className="hover:bg-[#FAF9F5]">
                                            <td className="py-3 px-4 font-bold text-[#E05320]">{n.order}</td>
                                            <td className="py-3 px-4 font-bold text-[#12100E]">{n.name}</td>
                                            <td className="py-3 px-4 text-right space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingNiveauId(n.id);
                                                        setNiveauName(n.name);
                                                        setNiveauOrder(n.order);
                                                        setIsNiveauModalOpen(true);
                                                    }}
                                                    className="p-1.5 bg-[#F7F6F0] hover:bg-[#EFECE3] text-[#12100E] rounded-lg cursor-pointer"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNiveau(n.id)}
                                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: FILIERES */}
                {activeTab === 'filieres' && (
                    <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-syne font-extrabold text-xl text-[#12100E]">Gestion des Filières</h2>
                                <p className="text-xs text-[#8E8A83] mt-1">Associez les filières aux niveaux d'études</p>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingFiliereId(null);
                                    setFiliereName('');
                                    setFiliereCode('');
                                    setFiliereNiveauId(niveaux[0]?.id || '');
                                    setIsFiliereModalOpen(true);
                                }}
                                className="px-4 py-2.5 bg-[#E05320] hover:bg-[#C94518] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Ajouter une Filière</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#E5E3D8] text-[#8E8A83] uppercase tracking-wider">
                                        <th className="py-3 px-4">Code</th>
                                        <th className="py-3 px-4">Nom Filière</th>
                                        <th className="py-3 px-4">Niveau</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0EEE6]">
                                    {filieres.map(f => {
                                        const parentNiveau = niveaux.find(n => n.id === f.niveauId);
                                        return (
                                            <tr key={f.id} className="hover:bg-[#FAF9F5]">
                                                <td className="py-3 px-4 font-bold text-[#E05320]">{f.code || '-'}</td>
                                                <td className="py-3 px-4 font-bold text-[#12100E]">{f.name}</td>
                                                <td className="py-3 px-4 text-[#8E8A83]">{parentNiveau?.name || 'N/A'}</td>
                                                <td className="py-3 px-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingFiliereId(f.id);
                                                            setFiliereName(f.name);
                                                            setFiliereCode(f.code || '');
                                                            setFiliereNiveauId(f.niveauId);
                                                            setIsFiliereModalOpen(true);
                                                        }}
                                                        className="p-1.5 bg-[#F7F6F0] hover:bg-[#EFECE3] text-[#12100E] rounded-lg cursor-pointer"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteFiliere(f.id)}
                                                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 4: MODULES */}
                {activeTab === 'modules' && (
                    <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-syne font-extrabold text-xl text-[#12100E]">Gestion des Modules</h2>
                                <p className="text-xs text-[#8E8A83] mt-1">Modules d'enseignement par semestre</p>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingModuleId(null);
                                    setModuleName('');
                                    setModuleCode('');
                                    setModuleSemestreId(semestres[0]?.id || '');
                                    setIsModuleModalOpen(true);
                                }}
                                className="px-4 py-2.5 bg-[#E05320] hover:bg-[#C94518] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Ajouter un Module</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#E5E3D8] text-[#8E8A83] uppercase tracking-wider">
                                        <th className="py-3 px-4">Code</th>
                                        <th className="py-3 px-4">Nom du Module</th>
                                        <th className="py-3 px-4">Semestre</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0EEE6]">
                                    {modules.map(m => {
                                        const sem = semestres.find(s => s.id === m.semestreId);
                                        return (
                                            <tr key={m.id} className="hover:bg-[#FAF9F5]">
                                                <td className="py-3 px-4 font-bold text-[#E05320]">{m.code || 'MOD'}</td>
                                                <td className="py-3 px-4 font-bold text-[#12100E]">{m.name}</td>
                                                <td className="py-3 px-4 text-[#8E8A83]">{sem?.name || 'S1'}</td>
                                                <td className="py-3 px-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingModuleId(m.id);
                                                            setModuleName(m.name);
                                                            setModuleCode(m.code || '');
                                                            setModuleSemestreId(m.semestreId);
                                                            setIsModuleModalOpen(true);
                                                        }}
                                                        className="p-1.5 bg-[#F7F6F0] hover:bg-[#EFECE3] text-[#12100E] rounded-lg cursor-pointer"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteModule(m.id)}
                                                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 5: RESSOURCES */}
                {activeTab === 'ressources' && (
                    <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                        <div>
                            <h2 className="font-syne font-extrabold text-xl text-[#12100E]">Téléverser une Ressource Documentaire</h2>
                            <p className="text-xs text-[#8E8A83] mt-1">Stockage des fichiers dans MinIO et enregistrement PostgreSQL</p>
                        </div>

                        <form onSubmit={handleUploadRessource} className="space-y-4 max-w-xl bg-[#FAF9F5] p-6 rounded-2xl border border-[#E5E3D8]">
                            <div>
                                <label className="block text-xs font-bold text-[#12100E] mb-1.5">Titre du document</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Chapitre 1 — Introduction à l'algorithmique"
                                    value={resTitle}
                                    onChange={(e) => setResTitle(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3D8] text-xs focus:outline-none focus:border-[#E05320]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#12100E] mb-1.5">Type de ressource</label>
                                    <select
                                        value={resType}
                                        onChange={(e) => setResType(e.target.value as 'COURSE' | 'TD' | 'TP')}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320]"
                                    >
                                        <option value="COURSE">COURS</option>
                                        <option value="TD">TD</option>
                                        <option value="TP">TP</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#12100E] mb-1.5">Module associé</label>
                                    <select
                                        value={resModuleId}
                                        onChange={(e) => setResModuleId(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320]"
                                    >
                                        <option value="">Sélectionner un module</option>
                                        {modules.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.code || 'MOD'} — {m.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#12100E] mb-1.5">Fichier (PDF, PPT...)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setResFile(e.target.files?.[0] || null)}
                                    required
                                    className="w-full text-xs text-[#8E8A83] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#12100E] file:text-white hover:file:bg-[#2A2724] cursor-pointer"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#E05320] hover:bg-[#C94518] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                <span>Téléverser la ressource</span>
                            </button>
                        </form>
                    </div>
                )}

                {/* TAB 6: USERS & ROLES */}
                {activeTab === 'users' && (
                    <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                        <div>
                            <h2 className="font-syne font-extrabold text-xl text-[#12100E]">Gestion des Utilisateurs & Rôles</h2>
                            <p className="text-xs text-[#8E8A83] mt-1">Attribuez les rôles étudiant (`STUDENT`), délégué (`DELEGATE`) ou administrateur (`ADMIN`)</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#E5E3D8] text-[#8E8A83] uppercase tracking-wider">
                                        <th className="py-3 px-4">Utilisateur</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Rôle Actuel</th>
                                        <th className="py-3 px-4 text-right">Changer le Rôle</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0EEE6]">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-[#FAF9F5]">
                                            <td className="py-3 px-4 font-bold text-[#12100E]">
                                                {u.firstName} {u.lastName}
                                            </td>
                                            <td className="py-3 px-4 text-[#8E8A83]">{u.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                                    u.role === 'ADMIN'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : u.role === 'DELEGATE'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleChangeRole(u.id, e.target.value as 'STUDENT' | 'DELEGATE' | 'ADMIN')}
                                                    className="px-3 py-1.5 rounded-lg border border-[#E5E3D8] text-xs font-bold bg-white focus:outline-none focus:border-[#E05320] cursor-pointer"
                                                >
                                                    <option value="STUDENT">STUDENT</option>
                                                    <option value="DELEGATE">DELEGATE</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* MODAL NIVEAU */}
            {isNiveauModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E5E3D8] pb-3">
                            <h3 className="font-syne font-extrabold text-lg">
                                {editingNiveauId ? 'Modifier le Niveau' : 'Créer un Niveau'}
                            </h3>
                            <button onClick={() => setIsNiveauModalOpen(false)} className="text-[#8E8A83]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveNiveau} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">Nom du Niveau</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 1ère Année / Master 1"
                                    value={niveauName}
                                    onChange={(e) => setNiveauName(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 rounded-xl border text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Ordre d'affichage</label>
                                <input
                                    type="number"
                                    value={niveauOrder}
                                    onChange={(e) => setNiveauOrder(Number(e.target.value))}
                                    required
                                    className="w-full px-3.5 py-2 rounded-xl border text-xs"
                                />
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-[#E05320] text-white rounded-xl font-bold text-xs">
                                Enregistrer
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL FILIERE */}
            {isFiliereModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E5E3D8] pb-3">
                            <h3 className="font-syne font-extrabold text-lg">
                                {editingFiliereId ? 'Modifier la Filière' : 'Créer une Filière'}
                            </h3>
                            <button onClick={() => setIsFiliereModalOpen(false)} className="text-[#8E8A83]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveFiliere} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">Nom de la Filière</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Génie Informatique"
                                    value={filiereName}
                                    onChange={(e) => setFiliereName(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 rounded-xl border text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Code Filière (ex: GINF)</label>
                                <input
                                    type="text"
                                    placeholder="GINF"
                                    value={filiereCode}
                                    onChange={(e) => setFiliereCode(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Niveau d'études</label>
                                <select
                                    value={filiereNiveauId}
                                    onChange={(e) => setFiliereNiveauId(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white"
                                >
                                    {niveaux.map(n => (
                                        <option key={n.id} value={n.id}>{n.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-[#E05320] text-white rounded-xl font-bold text-xs">
                                Enregistrer
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL MODULE */}
            {isModuleModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E5E3D8] pb-3">
                            <h3 className="font-syne font-extrabold text-lg">
                                {editingModuleId ? 'Modifier le Module' : 'Créer un Module'}
                            </h3>
                            <button onClick={() => setIsModuleModalOpen(false)} className="text-[#8E8A83]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveModule} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">Nom du Module</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Algorithmique et Prog I"
                                    value={moduleName}
                                    onChange={(e) => setModuleName(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 rounded-xl border text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Code Module (ex: M101)</label>
                                <input
                                    type="text"
                                    placeholder="M101"
                                    value={moduleCode}
                                    onChange={(e) => setModuleCode(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Semestre associé</label>
                                <select
                                    value={moduleSemestreId}
                                    onChange={(e) => setModuleSemestreId(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white"
                                >
                                    {semestres.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-[#E05320] text-white rounded-xl font-bold text-xs">
                                Enregistrer
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
