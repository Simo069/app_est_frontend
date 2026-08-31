import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { niveauService } from '../../services/api/niveauService';
import type { Niveau } from '../../services/api/niveauService';
import { filiereService } from '../../services/api/filiereService';
import type { Filiere } from '../../services/api/filiereService';
import { resourceService } from '../../services/api/resourceService';
import type { ResourceApiItem } from '../../services/api/resourceService';
import { FileCheck, Download, Eye, Filter, ArrowLeft, ShieldCheck, FileText, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExamsPage: React.FC = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [niveaux, setNiveaux] = useState<Niveau[]>([]);
    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [resources, setResources] = useState<ResourceApiItem[]>([]);

    const [selectedNiveauId, setSelectedNiveauId] = useState<string>('ALL');
    const [selectedFiliereId, setSelectedFiliereId] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Active Exam Preview Modal State
    const [activeExam, setActiveExam] = useState<ResourceApiItem | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!token) return;
            try {
                setLoading(true);
                const [nivs, fils, resList] = await Promise.all([
                    niveauService.getAll().catch(() => []),
                    filiereService.getAll().catch(() => []),
                    resourceService.getAll(token).catch(() => [])
                ]);

                setNiveaux(nivs);
                setFilieres(fils);
                setResources(resList);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Erreur chargement examens');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [token]);

    const handleDownloadExam = async (exam: ResourceApiItem) => {
        if (!token) return;
        try {
            const { url } = await resourceService.getDownloadUrl(exam.id, token);
            window.open(url, '_blank');
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Erreur lors du téléchargement de l\'examen');
        }
    };

    const handlePreviewExam = async (exam: ResourceApiItem) => {
        if (!token) return;
        setActiveExam(exam);
        try {
            setLoadingPreview(true);
            const { url } = await resourceService.getDownloadUrl(exam.id, token);
            setPreviewUrl(url);
        } catch (err: unknown) {
            console.error('Erreur lien aperçu:', err);
            setPreviewUrl(null);
        } finally {
            setLoadingPreview(false);
        }
    };

    // Filter resources list
    const filteredExams = resources.filter(res => {
        const mod = res.module;
        const sem = mod?.semestre;
        const fil = sem?.filiere;
        const niv = fil?.niveau;

        if (selectedNiveauId !== 'ALL' && niv?.id !== selectedNiveauId) return false;
        if (selectedFiliereId !== 'ALL' && fil?.id !== selectedFiliereId) return false;

        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            const matchTitle = res.title.toLowerCase().includes(q);
            const matchMod = mod?.name.toLowerCase().includes(q) || mod?.code?.toLowerCase().includes(q);
            if (!matchTitle && !matchMod) return false;
        }

        return true;
    });

    return (
        <div className="min-h-screen bg-[#F6F5F0] text-[#12100E]">
            {/* Header Banner */}
            <div className="bg-[#12100E] text-white border-b border-[#25221F] px-4 sm:px-8 py-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#E05320] text-white rounded-2xl flex items-center justify-center font-syne font-extrabold text-2xl shadow-lg">
                            <FileCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-white">
                                    Annales & Anciens Examens
                                </h1>
                                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    <ShieldCheck className="w-3 h-3" />
                                    Accès Réseau EST
                                </span>
                            </div>
                            <p className="text-xs text-[#8E8A83] mt-1">
                                Base d'épreuves et sujets d'examens réservée aux étudiants authentifiés ({user?.firstName} {user?.lastName})
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/modules')}
                        className="self-start md:self-center flex items-center gap-2 text-xs font-bold text-[#8E8A83] hover:text-white bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl border border-white/15 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour aux modules</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Filter Toolbar */}
                <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#12100E]">
                            <Filter className="w-4 h-4 text-[#E05320]" />
                            <span>Filtres de recherche d'examens</span>
                        </div>
                        <div className="text-xs font-bold text-[#8E8A83]">
                            {filteredExams.length} épreuve(s) trouvée(s)
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div>
                            <label className="block text-[11px] font-bold text-[#8E8A83] mb-1">Mots-clés / Titre</label>
                            <input
                                type="text"
                                placeholder="Ex: Algorithmique, Big Data..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3D8] text-xs focus:outline-none focus:border-[#E05320]"
                            />
                        </div>

                        {/* Niveau Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-[#8E8A83] mb-1">Niveau d'études</label>
                            <select
                                value={selectedNiveauId}
                                onChange={(e) => {
                                    setSelectedNiveauId(e.target.value);
                                    setSelectedFiliereId('ALL');
                                }}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320] font-medium"
                            >
                                <option value="ALL">Tous les niveaux</option>
                                {niveaux.map(n => (
                                    <option key={n.id} value={n.id}>{n.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filière Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-[#8E8A83] mb-1">Filière</label>
                            <select
                                value={selectedFiliereId}
                                onChange={(e) => setSelectedFiliereId(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3D8] text-xs bg-white focus:outline-none focus:border-[#E05320] font-medium"
                            >
                                <option value="ALL">Toutes les filières</option>
                                {filieres
                                    .filter(f => selectedNiveauId === 'ALL' || f.niveauId === selectedNiveauId)
                                    .map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.code ? `${f.code} — ` : ''}{f.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Exam Cards Grid */}
                {loading ? (
                    <div className="text-center py-12 text-[#8E8A83] text-xs font-medium">
                        Chargement des annales d'examens depuis MinIO et la base de données...
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-xs text-center font-bold">
                        {error}
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className="bg-white border border-[#E5E3D8] rounded-3xl p-12 text-center space-y-3">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="font-syne font-extrabold text-base text-[#12100E]">Aucun examen trouvé</h3>
                        <p className="text-xs text-[#8E8A83]">Modifiez vos critères de recherche ou essayez un autre niveau d'études.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredExams.map(exam => {
                            const mod = exam.module;
                            const sem = mod?.semestre;
                            const fil = sem?.filiere;
                            const sizeMb = exam.sizeBytes ? (exam.sizeBytes / (1024 * 1024)).toFixed(1) + ' MB' : '1 MB';

                            return (
                                <div
                                    key={exam.id}
                                    className="bg-white border border-[#E5E3D8] hover:border-[#D0CEC7] rounded-3xl p-6 transition-all shadow-2xs space-y-4 flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="bg-[#FDF0EB] text-[#E05320] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                {exam.type}
                                            </span>
                                            <span className="text-[10px] font-bold text-[#8E8A83]">
                                                {sizeMb}
                                            </span>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-extrabold text-[#8E8A83] uppercase tracking-wider">
                                                {mod?.code || 'MOD'} · {sem?.name || 'S1'}
                                            </div>
                                            <h3 className="font-syne font-extrabold text-base text-[#12100E] mt-1 leading-snug">
                                                {exam.title}
                                            </h3>
                                            <p className="text-xs text-[#8E8A83] mt-1">
                                                {mod?.name || 'Module'} — {fil?.name || 'EST Casa'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-[#F0EEE6] flex items-center gap-2">
                                        <button
                                            onClick={() => handlePreviewExam(exam)}
                                            className="flex-1 py-2.5 bg-[#F7F6F0] hover:bg-[#EFECE3] text-[#12100E] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-[#E05320]" />
                                            <span>Visualiser</span>
                                        </button>

                                        <button
                                            onClick={() => handleDownloadExam(exam)}
                                            className="flex-1 py-2.5 bg-[#12100E] hover:bg-[#2A2724] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Télécharger</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {activeExam && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col p-4 sm:p-8">
                    <div className="flex items-center justify-between text-white mb-4 max-w-5xl mx-auto w-full">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#E05320]" />
                            <h3 className="font-syne font-extrabold text-lg">{activeExam.title}</h3>
                        </div>
                        <button
                            onClick={() => {
                                setActiveExam(null);
                                setPreviewUrl(null);
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                            Fermer ✕
                        </button>
                    </div>

                    <div className="flex-1 bg-white rounded-3xl p-4 overflow-hidden max-w-5xl mx-auto w-full shadow-2xl">
                        {loadingPreview ? (
                            <div className="flex items-center justify-center h-full text-center space-y-3">
                                <div className="w-8 h-8 border-4 border-[#E05320] border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-xs font-bold text-[#8E8A83]">Chargement du sujet depuis MinIO...</p>
                            </div>
                        ) : previewUrl ? (
                            <iframe src={previewUrl} className="w-full h-full border-0 rounded-2xl" title={activeExam.title} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-xs text-[#8E8A83]">
                                Impossible d'afficher l'aperçu pour cet examen.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamsPage;
