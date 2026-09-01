import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { semestreService } from '../../../services/api/semestreService';
import type { Semestre } from '../../../services/api/semestreService';
import { filiereService } from '../../../services/api/filiereService';
import type { Filiere } from '../../../services/api/filiereService';
import { niveauService } from '../../../services/api/niveauService';
import type { Niveau } from '../../../services/api/niveauService';
import { Plus, Trash2, Edit3, X, CheckCircle, AlertCircle, Filter, Calendar } from 'lucide-react';

const AdminSemestresPage: React.FC = () => {
    const { token } = useAuth();

    const [semestres, setSemestres] = useState<Semestre[]>([]);
    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [niveaux, setNiveaux] = useState<Niveau[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Filters
    const [selectedNiveauFilter, setSelectedNiveauFilter] = useState<string>('');
    const [selectedFiliereFilter, setSelectedFiliereFilter] = useState<string>('');

    // Modal state
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [order, setOrder] = useState<number>(1);
    const [modalNiveauId, setModalNiveauId] = useState<string>('');
    const [modalFiliereId, setModalFiliereId] = useState<string>('');

    const loadData = async () => {
        try {
            setLoading(true);
            const [sems, fils, nivs] = await Promise.all([
                semestreService.getAll(),
                filiereService.getAll(),
                niveauService.getAll()
            ]);
            setSemestres(sems);
            setFilieres(fils);
            setNiveaux(nivs);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur chargement des données');
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

    // Filieres filtered by chosen filter Niveau
    const filteredFilieresForFilter = selectedNiveauFilter
        ? filieres.filter(f => f.niveauId === selectedNiveauFilter)
        : filieres;

    // Filieres filtered by modal chosen Niveau
    const modalFilieres = modalNiveauId
        ? filieres.filter(f => f.niveauId === modalNiveauId)
        : filieres;

    // Displayed semestres filtered by selected filter values
    const displayedSemestres = semestres.filter(s => {
        const parentFiliere = filieres.find(f => f.id === s.filiereId);
        if (selectedNiveauFilter && parentFiliere?.niveauId !== selectedNiveauFilter) {
            return false;
        }
        if (selectedFiliereFilter && s.filiereId !== selectedFiliereFilter) {
            return false;
        }
        return true;
    });

    const handleOpenModalForCreate = () => {
        setEditingId(null);
        setName('');
        setOrder(1);
        const firstNiv = niveaux[0]?.id || '';
        setModalNiveauId(firstNiv);
        const firstFil = filieres.find(f => f.niveauId === firstNiv)?.id || filieres[0]?.id || '';
        setModalFiliereId(firstFil);
        setIsOpen(true);
    };

    const handleOpenModalForEdit = (sem: Semestre) => {
        setEditingId(sem.id);
        setName(sem.name);
        setOrder(sem.order);
        const parentFil = filieres.find(f => f.id === sem.filiereId);
        setModalNiveauId(parentFil?.niveauId || '');
        setModalFiliereId(sem.filiereId);
        setIsOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!modalFiliereId) {
            setError('Veuillez sélectionner une filière.');
            return;
        }

        try {
            if (editingId) {
                await semestreService.update(editingId, { name, order, filiereId: modalFiliereId }, token);
                showSuccess('Semestre modifié avec succès !');
            } else {
                await semestreService.create({ name, order, filiereId: modalFiliereId }, token);
                showSuccess('Semestre créé avec succès !');
            }
            setIsOpen(false);
            setName('');
            setOrder(1);
            setEditingId(null);
            loadData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur enregistrement semestre');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce semestre ? Ses modules seront également impactés.')) return;
        try {
            await semestreService.delete(id, token);
            showSuccess('Semestre supprimé !');
            loadData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur suppression semestre');
        }
    };

    return (
        <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="font-syne font-extrabold text-xl text-[#12100E]">Gestion des Semestres</h2>
                    <p className="text-xs text-[#8E8A83] mt-1">Créez et gérez la structure des semestres par niveau et filière</p>
                </div>
                <button
                    onClick={handleOpenModalForCreate}
                    className="px-4 py-2.5 bg-[#E05320] hover:bg-[#C94518] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter un Semestre</span>
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-[#FAF9F5] border border-[#E5E3D8] rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 text-xs">
                <div className="flex items-center gap-2 text-[#8E8A83] font-bold">
                    <Filter className="w-4 h-4 text-[#E05320]" />
                    <span>Filtrer par :</span>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Niveau Filter */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#8E8A83] mb-1">Niveau d'études</label>
                        <select
                            value={selectedNiveauFilter}
                            onChange={(e) => {
                                setSelectedNiveauFilter(e.target.value);
                                setSelectedFiliereFilter('');
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
                            onChange={(e) => setSelectedFiliereFilter(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#E5E3D8] bg-white text-xs font-medium focus:outline-none focus:border-[#E05320]"
                        >
                            <option value="">Toutes les filières</option>
                            {filteredFilieresForFilter.map(f => (
                                <option key={f.id} value={f.id}>{f.name} {f.code ? `(${f.code})` : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Alerts */}
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

            {/* Table */}
            {loading ? (
                <p className="text-xs text-[#8E8A83] text-center py-6">Chargement des semestres...</p>
            ) : displayedSemestres.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#E5E3D8] rounded-2xl bg-[#FAF9F5]">
                    <Calendar className="w-8 h-8 text-[#8E8A83] mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-[#12100E]">Aucun semestre trouvé</p>
                    <p className="text-[11px] text-[#8E8A83] mt-0.5">
                        {selectedFiliereFilter || selectedNiveauFilter
                            ? "Aucun semestre ne correspond à vos critères de filtre."
                            : "Commencez par ajouter un semestre rattaché à une filière."}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#E5E3D8] text-[#8E8A83] uppercase tracking-wider">
                                <th className="py-3 px-4">Ordre</th>
                                <th className="py-3 px-4">Nom du Semestre</th>
                                <th className="py-3 px-4">Filière</th>
                                <th className="py-3 px-4">Niveau</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EEE6]">
                            {displayedSemestres.map(s => {
                                const fil = filieres.find(f => f.id === s.filiereId);
                                const niv = niveaux.find(n => n.id === fil?.niveauId);
                                return (
                                    <tr key={s.id} className="hover:bg-[#FAF9F5]">
                                        <td className="py-3.5 px-4 font-bold text-[#E05320]">
                                            <span className="w-6 h-6 rounded-lg bg-[#E05320]/10 text-[#E05320] flex items-center justify-center font-extrabold text-[11px]">
                                                S{s.order}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-[#12100E]">{s.name}</td>
                                        <td className="py-3.5 px-4 font-medium text-[#12100E]">
                                            {fil ? `${fil.name} ${fil.code ? `(${fil.code})` : ''}` : 'N/A'}
                                        </td>
                                        <td className="py-3.5 px-4 text-[#8E8A83]">
                                            <span className="px-2.5 py-1 bg-slate-100 rounded-full text-[11px] font-semibold text-slate-700">
                                                {niv?.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModalForEdit(s)}
                                                className="p-1.5 bg-[#F7F6F0] hover:bg-[#EFECE3] text-[#12100E] rounded-lg cursor-pointer transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer transition-colors"
                                                title="Supprimer"
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
            )}

            {/* Modal Create / Edit */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E5E3D8] pb-3">
                            <h3 className="font-syne font-extrabold text-lg text-[#12100E]">
                                {editingId ? 'Modifier le Semestre' : 'Créer un Semestre'}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-[#8E8A83] hover:text-[#12100E] rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 text-xs">
                            {/* Niveau Selection */}
                            <div>
                                <label className="block font-bold text-[#12100E] mb-1">1. Choisir le Niveau</label>
                                <select
                                    value={modalNiveauId}
                                    onChange={(e) => {
                                        const newNivId = e.target.value;
                                        setModalNiveauId(newNivId);
                                        const firstFil = filieres.find(f => f.niveauId === newNivId)?.id || '';
                                        setModalFiliereId(firstFil);
                                    }}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] bg-white text-xs text-[#12100E] focus:outline-none focus:border-[#E05320]"
                                >
                                    <option value="">Sélectionner un niveau</option>
                                    {niveaux.map(n => (
                                        <option key={n.id} value={n.id}>{n.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filiere Selection */}
                            <div>
                                <label className="block font-bold text-[#12100E] mb-1">2. Choisir la Filière</label>
                                <select
                                    value={modalFiliereId}
                                    onChange={(e) => setModalFiliereId(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] bg-white text-xs text-[#12100E] focus:outline-none focus:border-[#E05320]"
                                >
                                    <option value="">Sélectionner une filière</option>
                                    {modalFilieres.map(f => (
                                        <option key={f.id} value={f.id}>{f.name} {f.code ? `(${f.code})` : ''}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Semestre Name */}
                            <div>
                                <label className="block font-bold text-[#12100E] mb-1">Nom du Semestre</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Semestre 1 ou S1"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] text-xs text-[#12100E] focus:outline-none focus:border-[#E05320]"
                                />
                            </div>

                            {/* Semestre Order */}
                            <div>
                                <label className="block font-bold text-[#12100E] mb-1">Ordre du Semestre (ex: 1, 2, 3...)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={12}
                                    value={order}
                                    onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3D8] text-xs text-[#12100E] focus:outline-none focus:border-[#E05320]"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-2 py-3 bg-[#E05320] hover:bg-[#C94518] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                                Enregistrer
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSemestresPage;
