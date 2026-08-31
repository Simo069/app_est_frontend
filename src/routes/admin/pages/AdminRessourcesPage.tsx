import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { niveauService } from '../../../services/api/niveauService';
import type { Niveau } from '../../../services/api/niveauService';
import { filiereService } from '../../../services/api/filiereService';
import type { Filiere } from '../../../services/api/filiereService';
import { semestreService } from '../../../services/api/semestreService';
import type { Semestre } from '../../../services/api/semestreService';
import { moduleService } from '../../../services/api/moduleService';
import type { ModuleItem } from '../../../services/api/moduleService';
import { resourceService } from '../../../services/api/resourceService';
import type { ResourceApiItem, ResourceTypeEnum } from '../../../services/api/resourceService';
import { Upload, CheckCircle, AlertCircle, Layers, Trash2, Download, Filter, FileText } from 'lucide-react';

const AdminRessourcesPage: React.FC = () => {
    const { token } = useAuth();

    // Cascading dropdown lists for Upload
    const [niveaux, setNiveaux] = useState<Niveau[]>([]);
    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [semestres, setSemestres] = useState<Semestre[]>([]);
    const [modules, setModules] = useState<ModuleItem[]>([]);

    // Selected state hierarchy for Upload
    const [selectedNiveauId, setSelectedNiveauId] = useState('');
    const [selectedFiliereId, setSelectedFiliereId] = useState('');
    const [selectedSemestreId, setSelectedSemestreId] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState('');

    // Upload Form fields
    const [title, setTitle] = useState('');
    const [type, setType] = useState<ResourceTypeEnum>('COURSE');
    const [file, setFile] = useState<File | null>(null);

    // List & Filter States for Resource Table
    const [allResources, setAllResources] = useState<ResourceApiItem[]>([]);
    const [filterNiveauId, setFilterNiveauId] = useState<string>('ALL');
    const [filterFiliereId, setFilterFiliereId] = useState<string>('ALL');
    const [filterModuleId, setFilterModuleId] = useState<string>('ALL');
    const [filterType, setFilterType] = useState<string>('ALL');

    // UI Feedback
    const [uploading, setUploading] = useState(false);
    const [loadingList, setLoadingList] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Load Resources List
    const loadAllResources = async () => {
        if (!token) return;
        try {
            setLoadingList(true);
            const data = await resourceService.getAll(token);
            setAllResources(data);
        } catch (err) {
            console.error('Erreur chargement ressources admin:', err);
        } finally {
            setLoadingList(false);
        }
    };

    // 1. Initial Load: Fetch All Niveaux & Resources
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const nivs = await niveauService.getAll();
                setNiveaux(nivs);
                if (nivs.length > 0) {
                    setSelectedNiveauId(nivs[0].id);
                }
            } catch (err) {
                console.error('Erreur chargement niveaux:', err);
            }
        };

        loadInitialData();
        loadAllResources();
    }, [token]);

    // 2. Fetch Filieres when Niveau changes (Upload)
    useEffect(() => {
        const loadFilieres = async () => {
            if (!selectedNiveauId) {
                setFilieres([]);
                setSelectedFiliereId('');
                return;
            }
            try {
                const fils = await filiereService.getByNiveauId(selectedNiveauId);
                setFilieres(fils);
                if (fils.length > 0) {
                    setSelectedFiliereId(fils[0].id);
                } else {
                    setSelectedFiliereId('');
                }
            } catch (err) {
                console.error('Erreur chargement filières:', err);
                setFilieres([]);
                setSelectedFiliereId('');
            }
        };

        loadFilieres();
    }, [selectedNiveauId]);

    // 3. Fetch Semestres when Filiere changes (Upload)
    useEffect(() => {
        const loadSemestres = async () => {
            if (!selectedFiliereId) {
                setSemestres([]);
                setSelectedSemestreId('');
                return;
            }
            try {
                const sems = await semestreService.getByFiliereId(selectedFiliereId);
                setSemestres(sems);
                if (sems.length > 0) {
                    setSelectedSemestreId(sems[0].id);
                } else {
                    setSelectedSemestreId('');
                }
            } catch (err) {
                console.error('Erreur chargement semestres:', err);
                setSemestres([]);
                setSelectedSemestreId('');
            }
        };

        loadSemestres();
    }, [selectedFiliereId]);

    // 4. Fetch Modules when Semestre changes (Upload)
    useEffect(() => {
        const loadModules = async () => {
            if (!selectedSemestreId) {
                setModules([]);
                setSelectedModuleId('');
                return;
            }
            try {
                const mods = await moduleService.getBySemestreId(selectedSemestreId);
                setModules(mods);
                if (mods.length > 0) {
                    setSelectedModuleId(mods[0].id);
                } else {
                    setSelectedModuleId('');
                }
            } catch (err) {
                console.error('Erreur chargement modules:', err);
                setModules([]);
                setSelectedModuleId('');
            }
        };

        loadModules();
    }, [selectedSemestreId]);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!file || !title || !selectedModuleId || !token) {
            setError('Veuillez remplir tous les champs et sélectionner un fichier.');
            return;
        }

        try {
            setUploading(true);
            await resourceService.upload(file, title, type, selectedModuleId, token);
            showSuccess('Ressource téléversée avec succès dans MinIO et enregistrée !');
            setTitle('');
            setFile(null);
            loadAllResources();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur téléversement fichier');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteResource = async (id: string) => {
        if (!token || !confirm('Voulez-vous vraiment supprimer cette ressource de MinIO et de la base de données ?')) return;
        try {
            await resourceService.delete(id, token);
            showSuccess('Ressource supprimée avec succès.');
            loadAllResources();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur suppression ressource');
        }
    };

    const handleDownloadResource = async (id: string, title: string) => {
        if (!token) return;
        try {
            const { url } = await resourceService.getDownloadUrl(id, token);
            window.open(url, '_blank');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : `Erreur téléchargement "${title}"`);
        }
    };

    // Filter resources dynamically for management table
    const filteredResourcesList = allResources.filter(r => {
        const mod = r.module;
        const sem = mod?.semestre;
        const fil = sem?.filiere;
        const niv = fil?.niveau;

        if (filterNiveauId !== 'ALL' && niv?.id !== filterNiveauId) return false;
        if (filterFiliereId !== 'ALL' && fil?.id !== filterFiliereId) return false;
        if (filterModuleId !== 'ALL' && r.moduleId !== filterModuleId) return false;
        if (filterType !== 'ALL' && r.type !== filterType) return false;

        return true;
    });

    return (
        <div className="space-y-8">
            {/* SECTION 1: UPLOAD FORM WITH CASCADING SELECTION */}
            <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                    <h2 className="font-syne font-extrabold text-xl text-[#12100E]">1. Téléverser une Nouvelle Ressource Documentaire</h2>
                    <p className="text-xs text-[#8E8A83] mt-1">Sélectionnez la hiérarchie complète (Niveau ➔ Filière ➔ Semestre ➔ Module) avant de téléverser</p>
                </div>

                {error && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-5 bg-[#FAF9F5] p-6 sm:p-8 rounded-2xl border border-[#E5E3D8]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#E05320] border-b border-[#E5E3D8] pb-3">
                        <Layers className="w-4 h-4" />
                        <span>Arborescence Pédagogique (Hiérarchie d'Upload)</span>
                    </div>

                    {/* Cascading Dropdowns Step 1 & 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#12100E] mb-1.5">1. Niveau d'études</label>
                            <select
                                value={selectedNiveauId}
                                onChange={(e) => setSelectedNiveauId(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320] font-medium"
                            >
                                <option value="">Choisir le Niveau</option>
                                {niveaux.map(n => (
                                    <option key={n.id} value={n.id}>{n.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#12100E] mb-1.5">2. Filière d'études</label>
                            <select
                                value={selectedFiliereId}
                                onChange={(e) => setSelectedFiliereId(e.target.value)}
                                disabled={!selectedNiveauId || filieres.length === 0}
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320] disabled:opacity-50 font-medium"
                            >
                                <option value="">Choisir la Filière</option>
                                {filieres.map(f => (
                                    <option key={f.id} value={f.id}>
                                        {f.code ? `${f.code} — ` : ''}{f.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#12100E] mb-1.5">3. Semestre</label>
                            <select
                                value={selectedSemestreId}
                                onChange={(e) => setSelectedSemestreId(e.target.value)}
                                disabled={!selectedFiliereId || semestres.length === 0}
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320] disabled:opacity-50 font-medium"
                            >
                                <option value="">Choisir le Semestre</option>
                                {semestres.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#12100E] mb-1.5">4. Module d'enseignement</label>
                            <select
                                value={selectedModuleId}
                                onChange={(e) => setSelectedModuleId(e.target.value)}
                                disabled={!selectedSemestreId || modules.length === 0}
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320] disabled:opacity-50 font-bold text-[#E05320]"
                            >
                                <option value="">Select Target Module</option>
                                {modules.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.code || 'MOD'} — {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-[#E05320] border-b border-[#E5E3D8] pb-3 pt-3">
                        <Upload className="w-4 h-4" />
                        <span>Fichier & Métadonnées</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                            <label className="block text-xs font-bold text-[#12100E] mb-1.5">Titre du document</label>
                            <input
                                type="text"
                                placeholder="Ex: Chapitre 1 — Pointeurs et Structures"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3D8] text-xs focus:outline-none focus:border-[#E05320]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#12100E] mb-1.5">Type de ressource</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as ResourceTypeEnum)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320] font-bold"
                            >
                                <option value="COURSE">COURS</option>
                                <option value="TD">TD</option>
                                <option value="TP">TP</option>
                                <option value="EXAM">EXAMEN / ANNALES</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#12100E] mb-1.5">Fichier (PDF, PPT...)</label>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                required
                                className="w-full text-xs text-[#8E8A83] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#12100E] file:text-white hover:file:bg-[#2A2724] cursor-pointer"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading || !selectedModuleId}
                        className="w-full py-3.5 bg-[#E05320] hover:bg-[#C94518] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                    >
                        <Upload className="w-4 h-4" />
                        <span>{uploading ? 'Téléversement en cours vers MinIO...' : 'Téléverser la ressource officielle'}</span>
                    </button>
                </form>
            </div>

            {/* SECTION 2: MANAGEMENT TABLE & CASCADING FILTERS */}
            <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-syne font-extrabold text-xl text-[#12100E]">2. Liste & Filtrage des Ressources Téléversées</h2>
                        <p className="text-xs text-[#8E8A83] mt-1">Filtrez par Niveau, Filière ou Module pour consulter et gérer les fichiers enregistrés</p>
                    </div>
                    <span className="bg-[#12100E] text-white text-xs font-extrabold px-3 py-1.5 rounded-xl self-start sm:self-auto">
                        {filteredResourcesList.length} / {allResources.length} ressource(s)
                    </span>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E3D8] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#12100E]">
                        <Filter className="w-4 h-4 text-[#E05320]" />
                        <span>Filtres d'affichage</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Filter Niveau */}
                        <div>
                            <label className="block text-[11px] font-bold text-[#8E8A83] mb-1">Niveau</label>
                            <select
                                value={filterNiveauId}
                                onChange={(e) => {
                                    setFilterNiveauId(e.target.value);
                                    setFilterFiliereId('ALL');
                                    setFilterModuleId('ALL');
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320] font-medium"
                            >
                                <option value="ALL">Tous les niveaux</option>
                                {niveaux.map(n => (
                                    <option key={n.id} value={n.id}>{n.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Filière */}
                        <div>
                            <label className="block text-[11px] font-bold text-[#8E8A83] mb-1">Filière</label>
                            <select
                                value={filterFiliereId}
                                onChange={(e) => {
                                    setFilterFiliereId(e.target.value);
                                    setFilterModuleId('ALL');
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320] font-medium"
                            >
                                <option value="ALL">Toutes les filières</option>
                                {niveaux
                                    .filter(n => filterNiveauId === 'ALL' || n.id === filterNiveauId)
                                    .flatMap(() => filieres)
                                    .map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.code ? `${f.code} — ` : ''}{f.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Filter Module */}
                        <div>
                            <label className="block text-[11px] font-bold text-[#8E8A83] mb-1">Module</label>
                            <select
                                value={filterModuleId}
                                onChange={(e) => setFilterModuleId(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320] font-medium"
                            >
                                <option value="ALL">Tous les modules</option>
                                {allResources.map(r => r.module).filter(Boolean).map(m => (
                                    <option key={m!.id} value={m!.id}>
                                        {m!.code || 'MOD'} — {m!.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Type */}
                        <div>
                            <label className="block text-[11px] font-bold text-[#8E8A83] mb-1">Type de Document</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320] font-medium"
                            >
                                <option value="ALL">Tous les types (COURS, TD, TP, EXAMEN)</option>
                                <option value="COURSE">COURS</option>
                                <option value="TD">TD</option>
                                <option value="TP">TP</option>
                                <option value="EXAM">EXAMEN / ANNALES</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loadingList ? (
                    <p className="text-xs text-[#8E8A83] text-center py-8">Chargement des ressources en base de données...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#E5E3D8] text-[#8E8A83] uppercase tracking-wider">
                                    <th className="py-3 px-4">Titre du document</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Module rattaché</th>
                                    <th className="py-3 px-4">Filière / Niveau</th>
                                    <th className="py-3 px-4 text-center">Taille</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EEE6]">
                                {filteredResourcesList.map(res => {
                                    const mod = res.module;
                                    const sem = mod?.semestre;
                                    const fil = sem?.filiere;
                                    const niv = fil?.niveau;
                                    const typeLabel = res.type === 'COURSE' ? 'COURS' : res.type;
                                    const sizeMb = res.sizeBytes ? (res.sizeBytes / (1024 * 1024)).toFixed(1) + ' MB' : '1 MB';

                                    return (
                                        <tr key={res.id} className="hover:bg-[#FAF9F5]">
                                            <td className="py-3.5 px-4 font-bold text-[#12100E]">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-[#E05320] flex-shrink-0" />
                                                    <span>{res.title}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                                    typeLabel === 'COURS'
                                                        ? 'bg-[#E05320] text-white'
                                                        : typeLabel === 'TD'
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-indigo-600 text-white'
                                                }`}>
                                                    {typeLabel}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-[#12100E]">
                                                {mod?.code ? `${mod.code} — ` : ''}{mod?.name || 'N/A'}
                                            </td>
                                            <td className="py-3.5 px-4 text-[#8E8A83]">
                                                {fil?.name || 'Filière'} ({niv?.name || 'Niveau'})
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-mono text-[#8E8A83]">
                                                {sizeMb}
                                            </td>
                                            <td className="py-3.5 px-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleDownloadResource(res.id, res.title)}
                                                    title="Télécharger / Visualiser"
                                                    className="p-1.5 bg-[#F7F6F0] hover:bg-[#EFECE3] text-[#12100E] rounded-lg cursor-pointer"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteResource(res.id)}
                                                    title="Supprimer la ressource"
                                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredResourcesList.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-[#8E8A83]">
                                            Aucune ressource ne correspond aux filtres sélectionnés.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRessourcesPage;
