import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { moduleService } from '../../../services/api/moduleService';
import type { ModuleItem } from '../../../services/api/moduleService';
import { semestreService } from '../../../services/api/semestreService';
import type { Semestre } from '../../../services/api/semestreService';
import { filiereService } from '../../../services/api/filiereService';
import type { Filiere } from '../../../services/api/filiereService';
import { niveauService } from '../../../services/api/niveauService';
import type { Niveau } from '../../../services/api/niveauService';
import { Pagination } from '../../../components/common/Pagination';
import { Plus, Trash2, Edit3, X, CheckCircle, AlertCircle, Filter } from 'lucide-react';

const AdminModulesPage: React.FC = () => {
    const { token } = useAuth();

    const [modules, setModules] = useState<ModuleItem[]>([]);
    const [semestres, setSemestres] = useState<Semestre[]>([]);
    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [niveaux, setNiveaux] = useState<Niveau[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Filters
    const [selectedNiveauFilter, setSelectedNiveauFilter] = useState<string>('');
    const [selectedFiliereFilter, setSelectedFiliereFilter] = useState<string>('');
    const [selectedSemestreFilter, setSelectedSemestreFilter] = useState<string>('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    // Modal state
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [modalNiveauId, setModalNiveauId] = useState<string>('');
    const [modalFiliereId, setModalFiliereId] = useState<string>('');
    const [modalSemestreId, setModalSemestreId] = useState<string>('');

    const loadData = async () => {
        try {
            setLoading(true);
            const [mods, sems, fils, nivs] = await Promise.all([
                moduleService.getAll(),
                semestreService.getAll(),
                filiereService.getAll(),
                niveauService.getAll()
            ]);
            setModules(mods);
            setSemestres(sems);
            setFilieres(fils);
            setNiveaux(nivs);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur chargement des modules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    // Filter helpers
    const filteredFilieresForFilter = selectedNiveauFilter
        ? filieres.filter(f => f.niveauId === selectedNiveauFilter)
        : filieres;

    const filteredSemestresForFilter = selectedFiliereFilter
        ? semestres.filter(s => s.filiereId === selectedFiliereFilter)
        : selectedNiveauFilter
        ? semestres.filter(s => {
            const f = filieres.find(fil => fil.id === s.filiereId);
            return f?.niveauId === selectedNiveauFilter;
        })
        : semestres;

    // Modal helpers
    const modalFilieres = modalNiveauId
        ? filieres.filter(f => f.niveauId === modalNiveauId)
        : filieres;

    const modalSemestres = modalFiliereId
        ? semestres.filter(s => s.filiereId === modalFiliereId)
        : semestres;

    // Displayed modules
    const displayedModules = modules.filter(m => {
        const parentSem = semestres.find(s => s.id === m.semestreId);
        const parentFil = filieres.find(f => f.id === parentSem?.filiereId);

        if (selectedNiveauFilter && parentFil?.niveauId !== selectedNiveauFilter) return false;
        if (selectedFiliereFilter && parentSem?.filiereId !== selectedFiliereFilter) return false;
        if (selectedSemestreFilter && m.semestreId !== selectedSemestreFilter) return false;
        return true;
    });

    // Pagination calculations
    const totalPages = Math.ceil(displayedModules.length / pageSize) || 1;
    const paginatedModules = displayedModules.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [displayedModules.length, totalPages, currentPage]);

    const handleOpenCreateModal = () => {
        setEditingId(null);
        setName('');
        setCode('');
        const firstNiv = niveaux[0]?.id || '';
        setModalNiveauId(firstNiv);
        const firstFil = filieres.find(f => f.niveauId === firstNiv)?.id || filieres[0]?.id || '';
        setModalFiliereId(firstFil);
        const firstSem = semestres.find(s => s.filiereId === firstFil)?.id || semestres[0]?.id || '';
        setModalSemestreId(firstSem);
        setIsOpen(true);
    };

    const handleOpenEditModal = (m: ModuleItem) => {
        setEditingId(m.id);
        setName(m.name);
        setCode(m.code || '');
        setModalSemestreId(m.semestreId);

        const parentSem = semestres.find(s => s.id === m.semestreId);
        const parentFil = filieres.find(f => f.id === parentSem?.filiereId);
        setModalFiliereId(parentSem?.filiereId || '');
        setModalNiveauId(parentFil?.niveauId || '');

        setIsOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!modalSemestreId) {
            setError('Veuillez choisir un semestre.');
            return;
        }

        try {
            if (editingId) {
                await moduleService.update(editingId, { name, code: code || null, semestreId: modalSemestreId }, token);
                showSuccess('Module modifié avec succès !');
            } else {
                await moduleService.create({ name, code: code || null, semestreId: modalSemestreId }, token);
                showSuccess('Module créé avec succès !');
            }
            setIsOpen(false);
            setName('');
            setCode('');
            setEditingId(null);
            loadData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur enregistrement module');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce module ?')) return;
        try {
            await moduleService.delete(id, token);
            showSuccess('Module supprimé !');
            loadData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur suppression module');
        }
    };

    return (
        <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="font-syne font-extrabold text-xl text-[#12100E]">Gestion des Modules</h2>
                    <p className="text-xs text-[#8E8A83] mt-1">Créez et organisez les modules par semestre et par filière</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2.5 bg-[#E05320] hover:bg-[#C94518] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter un Module</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-[#FAF9F5] border border-[#E5E3D8] rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 text-xs">
                <div className="flex items-center gap-2 text-[#8E8A83] font-bold">
                    <Filter className="w-4 h-4 text-[#E05320]" />
                    <span>Filtrer par :</span>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Niveau Filter */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#8E8A83] mb-1">Niveau</label>
                        <select
                            value={selectedNiveauFilter}
                            onChange={(e) => {
                                setSelectedNiveauFilter(e.target.value);
                                setSelectedFiliereFilter('');
                                setSelectedSemestreFilter('');
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#E5E3D8] bg-white text-xs font-medium focus:outline-none focus:border-[#E05320]"
                        >
                            <option value="">Tous les niveaux</option>
                            {niveaux.map(n => (
                                <option key={n.id} value={n.id}>{n.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filiere Filter */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#8E8A83] mb-1">Filière</label>
                        <select
                            value={selectedFiliereFilter}
                            onChange={(e) => {
                                setSelectedFiliereFilter(e.target.value);
                                setSelectedSemestreFilter('');
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#E5E3D8] bg-white text-xs font-medium focus:outline-none focus:border-[#E05320]"
                        >
                            <option value="">Toutes les filières</option>
                            {filteredFilieresForFilter.map(f => (
                                <option key={f.id} value={f.id}>{f.name} {f.code ? `(${f.code})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    {/* Semestre Filter */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#8E8A83] mb-1">Semestre</label>
                        <select
                            value={selectedSemestreFilter}
                            onChange={(e) => {
                                setSelectedSemestreFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-[#E5E3D8] bg-white text-xs font-medium focus:outline-none focus:border-[#E05320]"
                        >
                            <option value="">Tous les semestres</option>
                            {filteredSemestresForFilter.map(s => (
                                <option key={s.id} value={s.id}>{s.name} (Ordre {s.order})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                    <span>{error}</span>
                </div>
            )}

            {successMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                    <span>{successMsg}</span>
                </div>
            )}

            {loading ? (
                <p className="text-xs text-[#8E8A83] text-center py-6">Chargement...</p>
            ) : displayedModules.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#E5E3D8] rounded-2xl bg-[#FAF9F5]">
                    <p className="text-xs font-bold text-[#12100E]">Aucun module trouvé</p>
                </div>
            ) : (
                <div className="overflow-x-auto space-y-4">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#E5E3D8] text-[#8E8A83] uppercase tracking-wider">
                                <th className="py-3 px-4">Code</th>
                                <th className="py-3 px-4">Nom du Module</th>
                                <th className="py-3 px-4">Semestre</th>
                                <th className="py-3 px-4">Filière / Niveau</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EEE6]">
                            {paginatedModules.map(m => {
                                const sem = semestres.find(s => s.id === m.semestreId);
                                const fil = filieres.find(f => f.id === sem?.filiereId);
                                const niv = niveaux.find(n => n.id === fil?.niveauId);

                                return (
                                    <tr key={m.id} className="hover:bg-[#FAF9F5]">
                                        <td className="py-3.5 px-4 font-bold text-[#E05320]">{m.code || 'MOD'}</td>
                                        <td className="py-3.5 px-4 font-bold text-[#12100E]">{m.name}</td>
                                        <td className="py-3.5 px-4 font-semibold text-[#12100E]">
                                            {sem ? `${sem.name} (S${sem.order})` : 'N/A'}
                                        </td>
                                        <td className="py-3.5 px-4 text-[#8E8A83]">
                                            {fil ? `${fil.name}` : 'N/A'} {niv ? `• ${niv.name}` : ''}
                                        </td>
                                        <td className="py-3.5 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenEditModal(m)}
                                                className="p-1.5 bg-[#F7F6F0] hover:bg-[#EFECE3] text-[#12100E] rounded-lg cursor-pointer"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(m.id)}
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

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={displayedModules.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b border-[#E5E3D8] pb-3">
                            <h3 className="font-syne font-extrabold text-lg text-[#12100E]">
                                {editingId ? 'Modifier le Module' : 'Créer un Module'}
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-[#8E8A83] hover:text-[#12100E]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            {/* 1. Niveau */}
                            <div>
                                <label className="block font-bold text-[#12100E] mb-1">1. Niveau</label>
                                <select
                                    value={modalNiveauId}
                                    onChange={(e) => {
                                        const newNivId = e.target.value;
                                        setModalNiveauId(newNivId);
                                        const firstFil = filieres.find(f => f.niveauId === newNivId)?.id || '';
                                        setModalFiliereId(firstFil);
                                        const firstSem = semestres.find(s => s.filiereId === firstFil)?.id || '';
                                        setModalSemestreId(firstSem);
                                    }}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] bg-white text-xs focus:outline-none focus:border-[#E05320]"
                                >
                                    <option value="">Sélectionner un niveau</option>
                                    {niveaux.map(n => (
                                        <option key={n.id} value={n.id}>{n.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 2. Filiere */}
                            <div>
                                <label className="block font-bold text-[#12100E] mb-1">2. Filière</label>
                                <select
                                    value={modalFiliereId}
                                    onChange={(e) => {
                                        const newFilId = e.target.value;
                                        setModalFiliereId(newFilId);
                                        const firstSem = semestres.find(s => s.filiereId === newFilId)?.id || '';
                                        setModalSemestreId(firstSem);
                                    }}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] bg-white text-xs focus:outline-none focus:border-[#E05320]"
                                >
                                    <option value="">Sélectionner une filière</option>
                                    {modalFilieres.map(f => (
                                        <option key={f.id} value={f.id}>{f.name} {f.code ? `(${f.code})` : ''}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 3. Semestre */}
                            <div>
                                <label className="block font-bold text-[#12100E] mb-1">3. Semestre associé</label>
                                <select
                                    value={modalSemestreId}
                                    onChange={(e) => setModalSemestreId(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] bg-white text-xs focus:outline-none focus:border-[#E05320]"
                                >
                                    <option value="">Sélectionner un semestre</option>
                                    {modalSemestres.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} (Ordre {s.order})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Module Name */}
                            <div>
                                <label className="block font-bold text-[#12100E] mb-1">Nom du Module</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Algorithmique et Prog I"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] text-xs focus:outline-none focus:border-[#E05320]"
                                />
                            </div>

                            {/* Module Code */}
                            <div>
                                <label className="block font-bold text-[#12100E] mb-1">Code Module (ex: M101)</label>
                                <input
                                    type="text"
                                    placeholder="M101"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] text-xs focus:outline-none focus:border-[#E05320]"
                                />
                            </div>

                            <button type="submit" className="w-full py-3 bg-[#E05320] text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm hover:bg-[#C94518]">
                                Enregistrer
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminModulesPage;
