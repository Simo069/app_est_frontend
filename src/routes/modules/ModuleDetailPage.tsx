import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelection } from '../../context/SelectionContext';
import type { DocumentResource, ResourceType, FileFormat } from '../../types/resource';
import {
    ArrowLeft,
    Download,
    Eye,
    Lock,
    Maximize2,
    ZoomIn,
    ZoomOut,
    ChevronLeft,
    ChevronRight,
    FileText,
    FolderX,
    FileCheck
} from 'lucide-react';
import LoginModal from '../../components/LoginModal';
import { semestreService } from '../../services/api/semestreService';
import { moduleService } from '../../services/api/moduleService';
import { resourceService } from '../../services/api/resourceService';
import type { ResourceApiItem } from '../../services/api/resourceService';
import { useAuth } from '../../context/AuthContext';

interface Semestre {
    id: string;
    name: string;
    order: number;
    filiereId: string;
}

interface Module {
    id: string;
    name: string;
    code: string | null;
    semestreId: string;
    _count?: {
        resources: number;
    };
}

const ModuleDetailPage: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
    const navigate = useNavigate();
    const { selection } = useSelection();
    const { token, isAuthenticated } = useAuth();

    // Data state
    const [semestres, setSemestres] = useState<Semestre[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);

    // Active resource state (COURS, TD, TP, EXAMENS)
    const [activeTab, setActiveTab] = useState<ResourceType>('COURS');
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

    // Dynamic Database Resources state
    const [dbResources, setDbResources] = useState<ResourceApiItem[]>([]);
    const [loadingResources, setLoadingResources] = useState(false);

    // Modals & Document Viewer state
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);

    const [loadingSemestres, setLoadingSemestres] = useState(true);
    const [loadingModules, setLoadingModules] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Real PDF presigned URL preview state
    const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);
    const [loadingDocUrl, setLoadingDocUrl] = useState(false);

    const levelDisplay = selection?.niveauLabel || '1ère Année';
    const filiereDisplay = selection?.filiereLabel || 'Filière';

    // 1. Fetch Semesters & All Modules for Filiere in Parallel (Once per Filiere)
    useEffect(() => {
        let isMounted = true;

        const fetchAllFiliereData = async () => {
            if (!selection?.filiere) {
                navigate('/selection/filiere');
                return;
            }
            try {
                // If semestres are already loaded for this filiere, don't set global full-screen loading
                if (semestres.length === 0) {
                    setLoadingSemestres(true);
                }

                const sems = await semestreService.getByFiliereId(selection.filiere);
                if (!isMounted) return;
                setSemestres(sems);

                if (sems.length > 0) {
                    // Fetch all modules for all semestres of the filiere in parallel
                    const modulesArrays = await Promise.all(sems.map(s => moduleService.getBySemestreId(s.id)));
                    if (!isMounted) return;
                    const allFiliereModules = modulesArrays.flat();

                    // Find target module from URL
                    let targetModule = allFiliereModules.find(m => m.id === moduleId);
                    if (!targetModule && allFiliereModules.length > 0) {
                        targetModule = allFiliereModules[0];
                    }

                    if (targetModule) {
                        setSelectedSemester(targetModule.semestreId);
                        setSelectedModule(targetModule);
                    } else {
                        setSelectedSemester(sems[0].id);
                    }
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setError('Erreur lors du chargement des semestres');
            } finally {
                if (isMounted) setLoadingSemestres(false);
            }
        };

        fetchAllFiliereData();

        return () => {
            isMounted = false;
        };
    }, [selection?.filiere, navigate]);

    // 2. Load Modules for Active Selected Semester instantly from Cache
    useEffect(() => {
        if (!selectedSemester) return;

        let isMounted = true;
        const fetchModules = async () => {
            try {
                if (modules.length === 0) {
                    setLoadingModules(true);
                }
                const data = await moduleService.getBySemestreId(selectedSemester);
                if (!isMounted) return;
                setModules(data);
            } catch (err) {
                console.error(err);
                if (isMounted) setError('Erreur lors du chargement des modules');
            } finally {
                if (isMounted) setLoadingModules(false);
            }
        };

        fetchModules();

        return () => {
            isMounted = false;
        };
    }, [selectedSemester]);

    // 3. Instant Reactivity when clicking a module or changing URL param (0ms wait for layout)
    useEffect(() => {
        if (!moduleId || modules.length === 0) return;

        const match = modules.find(m => m.id === moduleId);
        if (match) {
            setSelectedModule(match);
            if (match.semestreId !== selectedSemester) {
                setSelectedSemester(match.semestreId);
            }
        }
    }, [moduleId, modules, selectedSemester]);

    // 3. Fetch Dynamic Resources for selected module from API
    useEffect(() => {
        const fetchResources = async () => {
            if (!selectedModule?.id) return;
            try {
                setLoadingResources(true);
                const items = await resourceService.getByModuleAndType(selectedModule.id);
                setDbResources(items);
            } catch (err) {
                console.error('Erreur chargement ressources serveur:', err);
                setDbResources([]);
            } finally {
                setLoadingResources(false);
            }
        };

        fetchResources();
    }, [selectedModule?.id]);

    // Map DB items to DocumentResource format 100% dynamically
    const currentModuleResources: DocumentResource[] = dbResources.map(item => {
        const itemTypeRaw = String(item.type).toUpperCase();
        let type: ResourceType = 'COURS';
        if (itemTypeRaw === 'TD') type = 'TD';
        else if (itemTypeRaw === 'TP') type = 'TP';
        else if (itemTypeRaw === 'EXAM' || itemTypeRaw === 'EXAMENS') type = 'EXAMENS';

        const ext = item.filename ? item.filename.split('.').pop()?.toUpperCase() : 'PDF';
        const format: FileFormat = (ext === 'DOCX' || ext === 'DOC') ? 'DOCX' : (ext === 'PPTX' || ext === 'PPT') ? 'PPT' : 'PDF';
        const sizeMb = item.sizeBytes ? (item.sizeBytes / (1024 * 1024)).toFixed(1) + ' MB' : '1.0 MB';

        return {
            id: item.id,
            moduleId: item.moduleId,
            title: item.title,
            type,
            format,
            size: sizeMb,
            addedDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : 'Récemment',
            requiresAuth: (type === 'EXAMENS'),
            isOfficial: true
        };
    });

    const resourceCounts = {
        total: currentModuleResources.length,
        cours: currentModuleResources.filter(d => d.type === 'COURS').length,
        td: currentModuleResources.filter(d => d.type === 'TD').length,
        tp: currentModuleResources.filter(d => d.type === 'TP').length,
        examens: currentModuleResources.filter(d => d.type === 'EXAMENS').length
    };

    // Resources filtered by active tab (COURS, TD, TP, EXAMENS)
    const filteredDocs = currentModuleResources.filter(doc => doc.type === activeTab);

    // Currently selected document for viewer
    const activeDoc: DocumentResource | undefined =
        filteredDocs.find(doc => doc.id === selectedDocId) || filteredDocs[0];

    // Fetch presigned MinIO URL for selected document
    useEffect(() => {
        const fetchPreviewUrl = async () => {
            if (!activeDoc?.id) {
                setDocPreviewUrl(null);
                return;
            }

            // Exige la connexion uniquement pour les EXAMENS
            if (activeTab === 'EXAMENS' && !isAuthenticated) {
                setDocPreviewUrl(null);
                return;
            }

            try {
                setLoadingDocUrl(true);
                const { url } = await resourceService.getDownloadUrl(activeDoc.id, token);
                setDocPreviewUrl(url);
            } catch (err) {
                console.error('Erreur chargement aperçu:', err);
                setDocPreviewUrl(null);
            } finally {
                setLoadingDocUrl(false);
            }
        };

        fetchPreviewUrl();
    }, [activeDoc?.id, activeTab, isAuthenticated, token]);

    // Select first doc when tab changes
    useEffect(() => {
        if (filteredDocs.length > 0) {
            setSelectedDocId(filteredDocs[0].id);
        } else {
            setSelectedDocId(null);
        }
        setCurrentPage(1);
    }, [activeTab, selectedModule?.id, dbResources.length]);

    const handleDownload = async (doc: DocumentResource) => {
        if (activeTab === 'EXAMENS' && !isAuthenticated) {
            setIsLoginOpen(true);
            return;
        }

        try {
            const { url } = await resourceService.getDownloadUrl(doc.id, token);
            window.open(url, '_blank');
        } catch (err) {
            console.error('Erreur lien de téléchargement:', err);
            alert(`Impossible de télécharger "${doc.title}" pour le moment.`);
        }
    };

    if (loadingSemestres) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <p className="text-[#8E8A83] font-medium text-xs">Chargement du module...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <p className="text-red-500 mb-5 text-xs">{error}</p>
                <button
                    onClick={() => navigate('/modules')}
                    className="px-6 py-3 rounded-xl bg-[#E05320] text-white font-bold text-xs cursor-pointer"
                >
                    Retour aux modules
                </button>
            </div>
        );
    }

    const currentSemestre = semestres.find(s => s.id === selectedSemester);
    const semestreOrderDisplay = currentSemestre ? `SEMESTRE ${currentSemestre.order}` : 'SEMESTRE';
    const activeModuleCode = selectedModule?.code || 'MOD';
    const activeModuleName = selectedModule?.name || 'Module d\'enseignement';

    return (
        <div className="min-h-screen bg-[#F6F5F0] text-[#12100E]">
            {/* Top Bar Header */}
            <div className="bg-[#F6F5F0] border-b border-[#E5E3D8] px-4 sm:px-8 py-5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="text-xs font-extrabold uppercase tracking-widest text-[#8E8A83] mb-1">
                            {activeModuleCode} · {semestreOrderDisplay}
                        </div>
                        <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-[#12100E] leading-tight mb-2">
                            {activeModuleName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="bg-[#E05320] text-white font-extrabold px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider">
                                {activeTab}
                            </span>
                            <span className="text-[#8E8A83] font-medium">
                                {resourceCounts.total} ressource(s) · {filiereDisplay} — {levelDisplay}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/modules')}
                        className="self-start md:self-center flex items-center gap-2 text-xs font-bold text-[#8E8A83] hover:text-[#12100E] bg-white border border-[#E5E3D8] hover:border-[#D0CEC7] px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour aux modules</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area - 3 Column Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* COLUMN 1: LEFT SIDEBAR (MODULES LIST & SEMESTER) */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Semester Tabs */}
                        {/* <div className="grid grid-cols-2 gap-2 p-1 bg-white border border-[#E5E3D8] rounded-xl shadow-2xs">
                            {semestres.map(s => {
                                const isSelected = selectedSemester === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedSemester(s.id)}
                                        className={`py-2 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer text-center ${
                                            isSelected
                                                ? 'bg-[#12100E] text-white shadow-xs'
                                                : 'text-[#8E8A83] hover:text-[#12100E] hover:bg-[#F7F6F0]'
                                        }`}
                                    >
                                        Semestre {s.order}
                                    </button>
                                );
                            })}
                        </div> */}

                        {/* Modules Header */}
                        <div className="bg-white border border-[#E5E3D8] rounded-2xl p-4 shadow-xs">
                            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#8E8A83] mb-3">
                                MODULES · S{currentSemestre?.order || 1}
                            </div>

                            {loadingModules ? (
                                <p className="text-xs text-[#8E8A83] py-4 text-center">Chargement...</p>
                            ) : (
                                <div className="space-y-2">
                                    {modules.map(mod => {
                                        const isSelected = selectedModule?.id === mod.id;
                                        const modCode = mod.code || 'MOD';
                                        return (
                                            <button
                                                key={mod.id}
                                                onClick={() => {
                                                    setSelectedModule(mod);
                                                    navigate(`/modules/${mod.id}`);
                                                }}
                                                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                    isSelected
                                                        ? 'bg-[#FDF0EB] border-[#E05320] text-[#12100E] shadow-2xs'
                                                        : 'bg-white border-transparent hover:border-[#E5E3D8] hover:bg-[#F9F8F5]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded flex-shrink-0 ${
                                                        isSelected
                                                            ? 'bg-[#E05320] text-white'
                                                            : 'bg-[#F0EEE6] text-[#8E8A83]'
                                                    }`}>
                                                        {modCode}
                                                    </span>
                                                    <span className={`text-xs font-bold truncate ${
                                                        isSelected ? 'text-[#12100E]' : 'text-[#524E48]'
                                                    }`}>
                                                        {mod.name}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-medium text-[#8E8A83] flex-shrink-0">
                                                    {mod._count?.resources ?? 0} ress.
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUMN 2: MIDDLE PANEL (RESOURCE TABS: COURS, TD, TP, EXAMENS) */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* Resource Tabs: COURS, TD, TP, EXAMENS */}
                        <div className="grid grid-cols-4 gap-1 bg-white border border-[#E5E3D8] p-1.5 rounded-2xl shadow-2xs">
                            <button
                                onClick={() => setActiveTab('COURS')}
                                className={`py-2 rounded-xl font-bold text-[11px] flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                                    activeTab === 'COURS'
                                        ? 'bg-[#12100E] text-white shadow-xs'
                                        : 'text-[#8E8A83] hover:text-[#12100E] hover:bg-[#F7F6F0]'
                                }`}
                            >
                                <span>COURS</span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                    activeTab === 'COURS' ? 'bg-[#E05320] text-white' : 'bg-[#F0EEE6] text-[#8E8A83]'
                                }`}>
                                    {resourceCounts.cours}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('TD')}
                                className={`py-2 rounded-xl font-bold text-[11px] flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                                    activeTab === 'TD'
                                        ? 'bg-[#12100E] text-white shadow-xs'
                                        : 'text-[#8E8A83] hover:text-[#12100E] hover:bg-[#F7F6F0]'
                                }`}
                            >
                                <span>TD</span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                    activeTab === 'TD' ? 'bg-[#E05320] text-white' : 'bg-[#F0EEE6] text-[#8E8A83]'
                                }`}>
                                    {resourceCounts.td}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('TP')}
                                className={`py-2 rounded-xl font-bold text-[11px] flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                                    activeTab === 'TP'
                                        ? 'bg-[#12100E] text-white shadow-xs'
                                        : 'text-[#8E8A83] hover:text-[#12100E] hover:bg-[#F7F6F0]'
                                }`}
                            >
                                <span>TP</span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                    activeTab === 'TP' ? 'bg-[#E05320] text-white' : 'bg-[#F0EEE6] text-[#8E8A83]'
                                }`}>
                                    {resourceCounts.tp}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('EXAMENS')}
                                className={`py-2 rounded-xl font-bold text-[11px] flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                                    activeTab === 'EXAMENS'
                                        ? 'bg-[#E05320] text-white shadow-xs'
                                        : 'text-[#8E8A83] hover:text-[#12100E] hover:bg-[#F7F6F0]'
                                }`}
                            >
                                <span className="flex items-center gap-0.5">
                                    <FileCheck className="w-3 h-3" />
                                    <span>EXAMS</span>
                                </span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                    activeTab === 'EXAMENS' ? 'bg-white text-[#E05320]' : 'bg-[#F0EEE6] text-[#8E8A83]'
                                }`}>
                                    {resourceCounts.examens}
                                </span>
                            </button>
                        </div>

                        {/* Document Cards List */}
                        {loadingResources ? (
                            <div className="bg-white border border-[#E5E3D8] rounded-2xl p-8 text-center text-[#8E8A83] text-xs">
                                Chargement des ressources du serveur...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredDocs.map(doc => {
                                    const isSelected = (activeDoc?.id === doc.id);
                                    return (
                                        <div
                                            key={doc.id}
                                            onClick={() => setSelectedDocId(doc.id)}
                                            className={`bg-white border rounded-2xl p-4 transition-all cursor-pointer shadow-2xs hover:border-[#D0CEC7] ${
                                                isSelected
                                                    ? 'border-[#E05320] ring-1 ring-[#E05320]/20 bg-[#FFFDFB]'
                                                    : 'border-[#E5E3D8]'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                                                    doc.type === 'EXAMENS'
                                                        ? 'bg-[#E05320] text-white'
                                                        : doc.format === 'PDF'
                                                        ? 'bg-[#FDF0EB] text-[#E05320]'
                                                        : doc.format === 'PPT'
                                                        ? 'bg-[#FAF0E6] text-[#D97706]'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {doc.type === 'EXAMENS' ? 'EXAM' : doc.format}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm text-[#12100E] leading-snug mb-1">
                                                        {doc.title}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E8A83]">
                                                        <span>{doc.size}</span>
                                                        <span>·</span>
                                                        <span>{doc.addedDate}</span>
                                                        {doc.type === 'EXAMENS' && (
                                                            <span className="bg-amber-100 text-amber-700 font-extrabold text-[9px] px-1.5 py-0.2 rounded">
                                                                🔒 Connexion requise
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredDocs.length === 0 && (
                                    <div className="bg-white border border-[#E5E3D8] rounded-2xl p-8 text-center space-y-3">
                                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                                            <FolderX className="w-6 h-6" />
                                        </div>
                                        <p className="text-xs font-bold text-[#12100E]">Aucune ressource dans la catégorie {activeTab}</p>
                                        {/* <p className="text-[11px] text-[#8E8A83]">Les délégués et administrateurs peuvent téléverser des documents depuis le Dashboard Admin.</p> */}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* COLUMN 3: RIGHT PANEL (DOCUMENT VIEWER / PREVIEW) */}
                    <div className="lg:col-span-5">
                        <div className="bg-white border border-[#E5E3D8] rounded-2xl shadow-xs overflow-hidden flex flex-col h-full min-h-[550px]">

                            {activeDoc ? (
                                <>
                                    <div className="p-4 sm:p-5 border-b border-[#E5E3D8] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="font-syne font-extrabold text-base sm:text-lg text-[#12100E] leading-tight mb-1">
                                                {activeDoc.title}
                                            </h3>
                                            <p className="text-xs text-[#8E8A83] font-medium">
                                                {activeDoc.format} · {activeDoc.size}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Visualiser button */}
                                            <button
                                                onClick={() => setIsFullscreen(true)}
                                                disabled={activeTab === 'EXAMENS' && !isAuthenticated}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-[#F7F6F0] hover:bg-[#EFECE3] disabled:opacity-40 text-[#12100E] text-xs font-bold rounded-xl transition-all cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-[#E05320]" />
                                                <span>Plein écran</span>
                                            </button>

                                            {/* Telecharger button */}
                                            <button
                                                onClick={() => handleDownload(activeDoc)}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-[#12100E] hover:bg-[#2A2724] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Télécharger</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Toolbar controls */}
                                    <div className="px-4 py-2 bg-[#FAF9F5] border-b border-[#E5E3D8] flex items-center justify-between text-xs text-[#8E8A83]">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="p-1 hover:bg-white rounded disabled:opacity-30 cursor-pointer"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="font-medium text-[#12100E]">
                                                Page {currentPage}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                className="p-1 hover:bg-white rounded cursor-pointer"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setZoomLevel(prev => Math.max(75, prev - 25))}
                                                className="p-1 hover:bg-white rounded cursor-pointer"
                                            >
                                                <ZoomOut className="w-4 h-4" />
                                            </button>
                                            <span className="font-medium">{zoomLevel}%</span>
                                            <button
                                                onClick={() => setZoomLevel(prev => Math.min(150, prev + 25))}
                                                className="p-1 hover:bg-white rounded cursor-pointer"
                                            >
                                                <ZoomIn className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setIsFullscreen(true)}
                                                disabled={activeTab === 'EXAMENS' && !isAuthenticated}
                                                className="p-1 hover:bg-white rounded ml-2 cursor-pointer disabled:opacity-40"
                                            >
                                                <Maximize2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Document Canvas Body */}
                                    <div className="flex-1 bg-[#EAE8E0] p-4 sm:p-6 overflow-y-auto flex items-center justify-center min-h-[400px]">
                                        {docPreviewUrl ? (
                                            <iframe
                                                src={docPreviewUrl}
                                                className="w-full h-full min-h-[500px] bg-white rounded-xl border border-[#DDD9CE] shadow-md"
                                                title={activeDoc.title}
                                            />
                                        ) : loadingDocUrl ? (
                                            <div className="text-center p-8 space-y-3">
                                                <div className="w-8 h-8 border-4 border-[#E05320] border-t-transparent rounded-full animate-spin mx-auto" />
                                                <p className="text-xs font-bold text-[#8E8A83]">Chargement du document depuis le serveur...</p>
                                            </div>
                                        ) : activeTab === 'EXAMENS' && !isAuthenticated ? (
                                            <div className="bg-white rounded-2xl p-8 border border-[#DDD9CE] shadow-md text-center max-w-sm space-y-4">
                                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                                                    <Lock className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-[#12100E]">Authentification requise pour les Examens</h4>
                                                    <p className="text-xs text-[#8E8A83] mt-1">Les annales et sujets d'examens sont réservés aux étudiants connectés de l'EST Casa.</p>
                                                </div>
                                                <button
                                                    onClick={() => setIsLoginOpen(true)}
                                                    className="w-full py-2.5 bg-[#E05320] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#C94518] cursor-pointer"
                                                >
                                                    Se connecter pour accéder à l'épreuve
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-2xl p-8 border border-[#DDD9CE] shadow-md text-center max-w-sm space-y-4">
                                                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-[#12100E]">{activeDoc.title}</h4>
                                                    <p className="text-xs text-[#8E8A83] mt-1">{activeDoc.format} · {activeDoc.size}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDownload(activeDoc)}
                                                    className="w-full py-2.5 bg-[#12100E] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#2A2724] cursor-pointer flex items-center justify-center gap-2"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Télécharger le fichier</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="p-12 text-center text-[#8E8A83] text-xs my-auto space-y-2">
                                    <p className="font-bold text-[#12100E]">Aucune ressource sélectionnée</p>
                                    <p>Sélectionnez un document dans la colonne centrale pour l'afficher.</p>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>

            {/* Fullscreen Preview Modal */}
            {isFullscreen && activeDoc && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col p-4 sm:p-8 animate-fadeIn">
                    <div className="flex items-center justify-between text-white mb-4">
                        <div>
                            <h3 className="font-syne font-extrabold text-lg">{activeDoc.title}</h3>
                            <p className="text-xs text-slate-300">{activeDoc.format} · {activeDoc.size}</p>
                        </div>
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                            Fermer ✕
                        </button>
                    </div>

                    <div className="flex-1 bg-white rounded-2xl p-4 overflow-hidden max-w-5xl mx-auto w-full shadow-2xl">
                        {docPreviewUrl ? (
                            <iframe src={docPreviewUrl} className="w-full h-full border-0 rounded-xl" title={activeDoc.title} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-xs text-[#8E8A83]">
                                Aperçu plein écran non disponible.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Login Modal */}
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
    );
};

export default ModuleDetailPage;
