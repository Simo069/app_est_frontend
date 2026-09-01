import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../../context/SelectionContext';
import { Monitor, Server, HardHat, Radio, Zap, BarChart3 } from 'lucide-react';
import { filiereService } from '../../services/api/filiereService';
interface Filiere {
    id: string;
    name: string;
    code: string | null;
    niveauId: string;
}


const FiliereSelection: React.FC = () => {
    const navigate = useNavigate();
    const { selection, updateFiliere } = useSelection();
    const [selectedFiliere, setSelectedFiliere] = useState<string | null>(
        selection?.filiere || null
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filieres, setFilieres] = useState<Filiere[]>([]);


    // const filieres = [
    //     {
    //         id: 'gi',
    //         name: 'Génie Informatique',
    //         subtitle: 'Gestion & Développement Informatique',
    //         courses: 28,
    //         icon: <Monitor className="w-6 h-6 text-[#2B52DD]" />,
    //         iconBg: 'bg-[#EEF2FF]'
    //     },
    //     {
    //         id: 'dsi',
    //         name: 'DSI',
    //         subtitle: "Développement des Systèmes d'Information",
    //         courses: 22,
    //         icon: <Server className="w-6 h-6 text-[#107C41]" />,
    //         iconBg: 'bg-[#EBF8F2]'
    //     },
    //     {
    //         id: 'gc',
    //         name: 'Génie Civil',
    //         subtitle: 'Construction & Infrastructures',
    //         courses: 25,
    //         icon: <HardHat className="w-6 h-6 text-[#D97706]" />,
    //         iconBg: 'bg-[#FEF3C7]'
    //     },
    //     {
    //         id: 'telecom',
    //         name: 'Génie Télécoms',
    //         subtitle: 'Télécommunications & Réseaux',
    //         courses: 20,
    //         icon: <Radio className="w-6 h-6 text-[#7C3AED]" />,
    //         iconBg: 'bg-[#F3E8FF]'
    //     },
    //     {
    //         id: 'ge',
    //         name: 'Génie Électrique',
    //         subtitle: 'Électrotechnique & Énergie',
    //         courses: 18,
    //         icon: <Zap className="w-6 h-6 text-[#E05320]" />,
    //         iconBg: 'bg-[#FDF0EB]'
    //     },
    //     {
    //         id: 'gestion',
    //         name: 'Techniques de Gestion',
    //         subtitle: 'Management & Commerce',
    //         courses: 16,
    //         icon: <BarChart3 className="w-6 h-6 text-[#0284C7]" />,
    //         iconBg: 'bg-[#E0F2FE]'
    //     }
    // ];

    const fecthFileires = async () => {
        if(!selection?.niveau){
            navigate('/selection/niveau');
            return;
        }
        try{
            setLoading(true);
            setError(null);
            const data = await filiereService.getByNiveauId(selection.niveau);
            setFilieres(data);
        }catch(error){
            console.error(error);
            setError(
                'Une erreur est survenue lors du chargement des filières'
            );
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fecthFileires()
    },[selection?.niveau, navigate]);

    const handleSelect = (filiere: Filiere) => {
        setSelectedFiliere(filiere.id);

        updateFiliere(
            filiere.id,
            filiere.name
        );
    };

    const handleComplete = () => {
        if (!selectedFiliere) return;

        const filiere = filieres.find(
            (f) => f.id === selectedFiliere
        );

        if (filiere) {
            updateFiliere(
                filiere.id,
                filiere.name
            );

            navigate('/modules');
        }
    };
    if (loading) {
        return (
            <div className="py-10 text-center">
                Chargement des filières...
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-10 text-center">
                <p className="text-red-500 mb-4">
                    {error}
                </p>

                <button
                    onClick={() => navigate('/selection/niveau')}
                    className="px-6 py-3 rounded-xl bg-[#E05320] text-white"
                >
                    Retour aux niveaux
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-[#8E8A83] block mb-2">
                    ÉTAPE 2 / 3
                </span>

                <h1 className="font-syne font-extrabold text-3xl sm:text-5xl text-[#12100E] tracking-tight leading-[1.1] mb-3">
                    Choisissez <br /> votre filière
                </h1>

                <p className="text-[#8E8A83] font-medium text-sm sm:text-base">
                    Filières disponibles pour{' '}

                    <span className="font-bold text-[#12100E]">
                        {selection?.niveauLabel || 'Niveau sélectionné'}
                    </span>
                </p>
            </div>

            {/* Liste des filières */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
                {filieres.map((filiere, index) => {
                    const isSelected =
                        selectedFiliere === filiere.id;

                    // Icônes selon la position
                    // const icons = [
                    //     <Monitor className="w-6 h-6 text-[#2B52DD]" />,
                    //     <Server className="w-6 h-6 text-[#107C41]" />,
                    //     <HardHat className="w-6 h-6 text-[#D97706]" />,
                    //     <Radio className="w-6 h-6 text-[#7C3AED]" />,
                    //     <Zap className="w-6 h-6 text-[#E05320]" />,
                    //     <BarChart3 className="w-6 h-6 text-[#0284C7]" />,
                    // ];

                    // const iconBgs = [
                    //     'bg-[#EEF2FF]',
                    //     'bg-[#EBF8F2]',
                    //     'bg-[#FEF3C7]',
                    //     'bg-[#F3E8FF]',
                    //     'bg-[#FDF0EB]',
                    //     'bg-[#E0F2FE]',
                    // ];

                    return (
                        <div
                            key={filiere.id}
                            onClick={() => handleSelect(filiere)}
                            className={`
                                relative cursor-pointer rounded-2xl p-5 sm:p-6 
                                transition-all duration-200 
                                flex items-center justify-between gap-4

                                ${
                                    isSelected
                                        ? 'bg-[#FDF8F5] border-2 border-[#E05320] shadow-sm'
                                        : 'bg-white border border-[#E5E3D8] hover:border-[#D0CEC7] hover:shadow-xs'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4">
                                {/* <div
                                    className={`
                                        w-14 h-14 rounded-2xl 
                                        ${iconBgs[index % iconBgs.length]}
                                        flex items-center justify-center 
                                        flex-shrink-0
                                    `}
                                >
                                    {icons[index % icons.length]}
                                </div> */}

                                <div>
                                    <h3 className="font-syne font-extrabold text-lg sm:text-xl text-[#12100E] mb-0.5">
                                        {filiere.name}
                                    </h3>

                                    <p className="text-[#8E8A83] text-xs font-medium">
                                        {filiere.code || 'Filière'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Aucune filière */}
            {filieres.length === 0 && (
                <div className="text-center py-10 text-[#8E8A83]">
                    Aucune filière disponible pour ce niveau.
                </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/selection/niveau')}
                    className="px-6 py-3 rounded-2xl border border-[#DDD9CE] hover:bg-[#EAE7DC] text-[#12100E] font-bold text-sm transition-all cursor-pointer"
                >
                    ← Changer de niveau
                </button>

                <button
                    onClick={handleComplete}
                    disabled={!selectedFiliere}
                    className={`
                        px-8 py-3.5 rounded-2xl font-bold text-sm 
                        transition-all duration-200 cursor-pointer 
                        shadow-md inline-flex items-center gap-2

                        ${
                            selectedFiliere
                                ? 'bg-[#E05320] hover:bg-[#C94518] text-white hover:shadow-lg'
                                : 'bg-[#E6E4DD] text-[#8E8A83] cursor-not-allowed shadow-none'
                        }
                    `}
                >
                    <span>Voir les modules</span>
                    <span>→</span>
                </button>
            </div>
        </div>
    );
};

export default FiliereSelection;
