import React, { useEffect, useState } from 'react';
import { useSelection } from '../../context/SelectionContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Edit3, ArrowDown, Lock } from 'lucide-react';
import LoginModal from '../../components/LoginModal';
import { semestreService } from '../../services/api/semestreService';
import { moduleService } from '../../services/api/moduleService';

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
}

const ModulesPage: React.FC = () => {
    const { selection } = useSelection();
    const navigate = useNavigate();

    const [semestres, setSemestres] = useState<Semestre[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
    const [loadingSemestres, setLoadingSemestres] = useState(true);
    const [loadingModules, setLoadingModules] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const levelDisplay = selection?.niveauLabel || 'Niveau';
    const filiereDisplay = selection?.filiereLabel || 'Filiere';

    // 1. RECUPERER LES SEMESTRES & PRE-CHARGER TOUS LES MODULES DE LA FILIERE
    useEffect(() => {
        const fetchSemestresAndAllModules = async () => {
            if (!selection?.filiere) {
                navigate('/selection/filiere');
                return;
            }
            try {
                setLoadingSemestres(true);
                const semData = await semestreService.getByFiliereId(selection.filiere);
                setSemestres(semData);
                if (semData.length > 0) {
                    setSelectedSemester(semData[0].id);
                    // Pré-charger tous les modules des semestres en arrière-plan / parallèle
                    Promise.all(semData.map(s => moduleService.getBySemestreId(s.id))).catch(err => {
                        console.error('Erreur pré-chargement modules:', err);
                    });
                }
            } catch (error) {
                console.error(error);
                setError('Une erreur est survenue lors du chargement des semestres');
            } finally {
                setLoadingSemestres(false);
            }
        };

        fetchSemestresAndAllModules();
    }, [selection?.filiere, navigate]);

    // 2. RECUPERER LES MODULES DU SEMESTRE SELECTIONNE
    useEffect(() => {
        const fetchModules = async () => {
            if (!selectedSemester) {
                setModules([]);
                return;
            }
            try {
                setLoadingModules(true);
                const data = await moduleService.getBySemestreId(selectedSemester);
                setModules(data);
            } catch (error) {
                console.error(error);
                setError('Une erreur est survenue lors du chargement des modules');
            } finally {
                setLoadingModules(false);
            }
        };
        fetchModules();
    }, [selectedSemester]);

    if (loadingSemestres) { return (<div className="max-w-6xl mx-auto px-4 py-20 text-center"> <p className="text-[#8E8A83] font-medium"> Chargement des semestres... </p> </div>); }

    if (error) { return (<div className="max-w-6xl mx-auto px-4 py-20 text-center"> <p className="text-red-500 mb-5"> {error} </p> <button onClick={() => navigate('/selection/filiere')} className="px-6 py-3 rounded-xl bg-[#E05320] text-white font-bold" > Retour aux filières </button> </div>); }

    const currentSemestre = semestres.find((semestre) => semestre.id === selectedSemester);


    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Top Selection Summary Bar */}
            <div className="bg-white border border-[#E5E3D8] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 mb-6 shadow-xs">
                <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
                    <div>
                        <span className="text-[#8E8A83] font-bold uppercase tracking-wider text-[11px] block">
                            NIVEAU
                        </span>
                        <span className="font-syne font-extrabold text-[#12100E] text-base">
                            {levelDisplay}
                        </span>
                    </div>
                    <div className="hidden sm:block h-8 w-[1px] bg-[#E5E3D8]" />
                    <div>
                        <span className="text-[#8E8A83] font-bold uppercase tracking-wider text-[11px] block">
                            FILIÈRE
                        </span>
                        <span className="font-syne font-extrabold text-[#12100E] text-base">
                            {filiereDisplay}
                        </span>
                    </div>
                    <div className="hidden sm:block h-8 w-[1px] bg-[#E5E3D8]" />
                    <div> <span className="text-[#8E8A83] font-bold uppercase tracking-wider text-[11px] block"> MODULES </span>
                        <span className="font-syne font-extrabold text-[#12100E] text-base"> {modules.length} modules </span>
                    </div> </div> <button onClick={() => navigate('/selection/niveau')} className="flex items-center gap-1.5 text-xs font-bold text-[#E05320] hover:underline cursor-pointer" >
                    <Edit3 className="w-3.5 h-3.5" /> <span>Modifier</span> </button> </div>


            {/* Semester Switcher Tabs */}
            <div className="flex items-center gap-3 mb-6 flex-wrap"> {semestres.map((semestre) => { const isSelected = selectedSemester === semestre.id; return (<button key={semestre.id} onClick={() => setSelectedSemester(semestre.id)} className={` px-6 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer inline-flex items-center gap-2 ${isSelected ? 'bg-[#E05320] text-white shadow-xs' : 'bg-white border border-[#E5E3D8] text-[#12100E] hover:border-[#D0CEC7]'} `} > <span> {semestre.order === 1 ? '📙' : '📗'} </span> <span> {semestre.name} </span> </button>); })} </div>

            {/* Semester Header Badge */}
            {currentSemestre && (<div className="mb-4"> <span className="text-xs font-extrabold uppercase tracking-widest text-[#E05320]"> {currentSemestre.name} </span> <span className="text-xs font-medium text-[#8E8A83] ml-3"> {modules.length} modules </span> </div>)}

            {/* ============================== */} {/* MODULES LOADING */}
            {/* ============================== */}
            {loadingModules && (<div className="py-10 text-center"> <p className="text-[#8E8A83]"> Chargement des modules... </p> </div>)}
            {/* Modules Grid */}

            
{!loadingModules && ( <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10"> {modules.map((mod) => ( <div key={mod.id} className="bg-white border border-[#E5E3D8] rounded-2xl p-5 shadow-xs hover:border-[#D0CEC7] transition-all flex flex-col justify-between" > <div> {/* CODE */} <div className="flex items-center justify-between mb-3"> <span className="text-xs font-semibold text-[#8E8A83]"> {mod.code || 'MODULE'} </span> </div> {/* NAME */} <h3 className="font-syne font-extrabold text-base sm:text-lg text-[#12100E] mb-5 leading-snug"> {mod.name} </h3> {/* FUTUR: RESOURCES */} <div className="flex flex-wrap items-center gap-2 mb-6"> <span className="bg-[#F7F6F0] text-[#12100E] text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1"> <FileText className="w-3.5 h-3.5 text-slate-400" /> Ressources </span> <span className="bg-[#EBF5EF] text-[#0F5A3B] text-xs font-semibold px-2.5 py-1 rounded-lg"> 📝 Examens </span> </div> </div> {/* ACTION */} <button onClick={() => navigate(`/modules/${mod.id}`)} className="w-full bg-[#12100E] hover:bg-[#2A2724] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs" > <ArrowDown className="w-3.5 h-3.5" /> <span>Voir</span> </button> </div> ))} </div> )}
            {/* AUCUN MODULE */} {/* ============================== */} {!loadingModules && currentSemestre && modules.length === 0 && ( <div className="text-center py-10 text-[#8E8A83]"> Aucun module disponible pour ce semestre. </div> )}
            {/* Anciens Examens Section (Page 3)
            <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-7 mb-10 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-syne font-extrabold text-lg sm:text-xl text-[#12100E] flex items-center gap-2">
                        <span>📝</span>
                        <span>Anciens Examens - Semestre 1</span>
                    </h2>

                    <span className="bg-[#FDF0EB] text-[#E05320] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        21 FICHIERS
                    </span>
                </div>

                <div className="divide-y divide-[#F0EEE6]">
                    {exams.map((exam, idx) => (
                        <div key={idx} className="py-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#F7F6F0] flex items-center justify-center text-slate-500">
                                    <FileText className="w-5 h-5 text-[#8E8A83]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm sm:text-base text-[#12100E]">
                                        {exam.title}
                                    </h4>
                                    <p className="text-xs font-medium text-[#8E8A83]">
                                        {exam.subtitle}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="font-syne font-extrabold text-2xl tracking-tighter text-[#E05320]">
                                    {exam.year}
                                </span>

                                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${exam.typeClass}`}>
                                    {exam.type}
                                </span>

                                <button
                                    onClick={() => setIsLoginOpen(true)}
                                    className="w-9 h-9 rounded-xl bg-[#12100E] hover:bg-[#2A2724] text-white flex items-center justify-center transition-all cursor-pointer"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}

            {/* Bottom CTA Dark Banner (Page 3) */}
            <div className="bg-[#101726] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl mb-8">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center flex-shrink-0">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-syne font-extrabold text-xl sm:text-2xl text-white mb-1">
                            Connectez-vous pour télécharger
                        </h3>
                        <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                            La consultation des titres de cours et examens est libre et gratuite. Pour télécharger les fichiers, il suffit de créer un compte étudiant en 30 secondes.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsLoginOpen(true)}
                    className="bg-[#E05320] hover:bg-[#C94518] text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                    Créer mon compte →
                </button>
            </div>

            {/* Bottom Left Navigation */}
            <div className="flex justify-start">
                <button
                    onClick={() => navigate('/selection/filiere')}
                    className="px-6 py-3 rounded-2xl border border-[#DDD9CE] hover:bg-[#EAE7DC] text-[#12100E] font-bold text-sm transition-all cursor-pointer"
                >
                    ← Changer de filière
                </button>
            </div>

            {/* Login Modal */}
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
    );
};

export default ModulesPage;