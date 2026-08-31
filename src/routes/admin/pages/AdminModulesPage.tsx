import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { moduleService } from '../../../services/api/moduleService';
import type { ModuleItem } from '../../../services/api/moduleService';
import { semestreService } from '../../../services/api/semestreService';
import type { Semestre } from '../../../services/api/semestreService';
import { Plus, Trash2, Edit3, X, CheckCircle, AlertCircle } from 'lucide-react';

const AdminModulesPage: React.FC = () => {
    const { token } = useAuth();

    const [modules, setModules] = useState<ModuleItem[]>([]);
    const [semestres, setSemestres] = useState<Semestre[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Modal state
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [semestreId, setSemestreId] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const [mods, sems] = await Promise.all([
                moduleService.getAll(),
                semestreService.getAll()
            ]);
            setModules(mods);
            setSemestres(sems);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur chargement modules');
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
                await moduleService.update(editingId, { name, code: code || null, semestreId }, token);
                showSuccess('Module modifié avec succès !');
            } else {
                await moduleService.create({ name, code: code || null, semestreId }, token);
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-syne font-extrabold text-xl text-[#12100E]">Gestion des Modules</h2>
                    <p className="text-xs text-[#8E8A83] mt-1">Créez et organisez les modules par semestre</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setName('');
                        setCode('');
                        setSemestreId(semestres[0]?.id || '');
                        setIsOpen(true);
                    }}
                    className="px-4 py-2.5 bg-[#E05320] hover:bg-[#C94518] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter un Module</span>
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
                                        <td className="py-3.5 px-4 font-bold text-[#E05320]">{m.code || 'MOD'}</td>
                                        <td className="py-3.5 px-4 font-bold text-[#12100E]">{m.name}</td>
                                        <td className="py-3.5 px-4 text-[#8E8A83]">{sem?.name || 'S1'}</td>
                                        <td className="py-3.5 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingId(m.id);
                                                    setName(m.name);
                                                    setCode(m.code || '');
                                                    setSemestreId(m.semestreId);
                                                    setIsOpen(true);
                                                }}
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
                </div>
            )}

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E5E3D8] pb-3">
                            <h3 className="font-syne font-extrabold text-lg">
                                {editingId ? 'Modifier le Module' : 'Créer un Module'}
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-[#8E8A83]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold mb-1">Nom du Module</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Algorithmique et Prog I"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Code Module (ex: M101)</label>
                                <input
                                    type="text"
                                    placeholder="M101"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Semestre associé</label>
                                <select
                                    value={semestreId}
                                    onChange={(e) => setSemestreId(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white"
                                >
                                    {semestres.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
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

export default AdminModulesPage;
