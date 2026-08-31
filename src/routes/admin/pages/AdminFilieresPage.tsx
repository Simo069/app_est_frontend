import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { filiereService } from '../../../services/api/filiereService';
import type { Filiere } from '../../../services/api/filiereService';
import { niveauService } from '../../../services/api/niveauService';
import type { Niveau } from '../../../services/api/niveauService';
import { Plus, Trash2, Edit3, X, CheckCircle, AlertCircle } from 'lucide-react';

const AdminFilieresPage: React.FC = () => {
    const { token } = useAuth();

    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [niveaux, setNiveaux] = useState<Niveau[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Modal state
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [niveauId, setNiveauId] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const [fils, nivs] = await Promise.all([
                filiereService.getAll(),
                niveauService.getAll()
            ]);
            setFilieres(fils);
            setNiveaux(nivs);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur chargement données');
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingId) {
                await filiereService.update(editingId, { name, code: code || null, niveauId }, token);
                showSuccess('Filière modifiée avec succès !');
            } else {
                await filiereService.create({ name, code: code || null, niveauId }, token);
                showSuccess('Filière créée avec succès !');
            }
            setIsOpen(false);
            setName('');
            setCode('');
            setEditingId(null);
            loadData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur enregistrement filière');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette filière ?')) return;
        try {
            await filiereService.delete(id, token);
            showSuccess('Filière supprimée !');
            loadData();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur suppression filière');
        }
    };

    return (
        <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-syne font-extrabold text-xl text-[#12100E]">Gestion des Filières</h2>
                    <p className="text-xs text-[#8E8A83] mt-1">Gérez la liste des filières rattachées aux niveaux</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setName('');
                        setCode('');
                        setNiveauId(niveaux[0]?.id || '');
                        setIsOpen(true);
                    }}
                    className="px-4 py-2.5 bg-[#E05320] hover:bg-[#C94518] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter une Filière</span>
                </button>
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

            {loading ? (
                <p className="text-xs text-[#8E8A83] text-center py-6">Chargement...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#E5E3D8] text-[#8E8A83] uppercase tracking-wider">
                                <th className="py-3 px-4">Code</th>
                                <th className="py-3 px-4">Nom de la Filière</th>
                                <th className="py-3 px-4">Niveau</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EEE6]">
                            {filieres.map(f => {
                                const parentNiv = niveaux.find(n => n.id === f.niveauId);
                                return (
                                    <tr key={f.id} className="hover:bg-[#FAF9F5]">
                                        <td className="py-3.5 px-4 font-bold text-[#E05320]">{f.code || '-'}</td>
                                        <td className="py-3.5 px-4 font-bold text-[#12100E]">{f.name}</td>
                                        <td className="py-3.5 px-4 text-[#8E8A83]">{parentNiv?.name || 'N/A'}</td>
                                        <td className="py-3.5 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingId(f.id);
                                                    setName(f.name);
                                                    setCode(f.code || '');
                                                    setNiveauId(f.niveauId);
                                                    setIsOpen(true);
                                                }}
                                                className="p-1.5 bg-[#F7F6F0] hover:bg-[#EFECE3] text-[#12100E] rounded-lg cursor-pointer"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(f.id)}
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
            )}

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E5E3D8] pb-3">
                            <h3 className="font-syne font-extrabold text-lg">
                                {editingId ? 'Modifier la Filière' : 'Créer une Filière'}
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-[#8E8A83]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">Nom de la Filière</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Génie Informatique"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Code Filière (ex: GINF)</label>
                                <input
                                    type="text"
                                    placeholder="GINF"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Niveau rattaché</label>
                                <select
                                    value={niveauId}
                                    onChange={(e) => setNiveauId(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white"
                                >
                                    {niveaux.map(n => (
                                        <option key={n.id} value={n.id}>{n.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-3 bg-[#E05320] text-white rounded-xl font-bold text-xs cursor-pointer">
                                Enregistrer
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFilieresPage;
