import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../../context/SelectionContext';
import { niveauService } from '../../services/api/niveauService';


interface Niveau {
    id: string;
    name: string;
    order: number
}




const NiveauSelection: React.FC = () => {
    const navigate = useNavigate();
    const { selection, updateNiveau } = useSelection();
    const [selectedNiveau, setSelectedNiveau] = useState<string | null>(
        selection?.niveau || null
    );

    const [niveaux, setNiveaux] = useState<Niveau[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNiveaux = async () => {
        try {
            setLoading(true);
            const data = await niveauService.getAll();
            const niveauxTries = data.sort(
                (a, b) => a.order - b.order
            );
            setNiveaux(niveauxTries);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Une erreur est survenue'
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNiveaux();
    }, []);
    // const niveaux = [
    //     {
    //         id: '1a',
    //         shortLabel: '1A',
    //         badge: 'BAC+1',
    //         badgeClass: 'bg-[#FDF0EB] text-[#E05320]',
    //         description: '1ère Année'
    //     },
    //     {
    //         id: '2a',
    //         shortLabel: '2A',
    //         badge: 'BAC+2',
    //         badgeClass: 'bg-[#FDF0EB] text-[#E05320]',
    //         description: '2ème Année'
    //     },
    //     {
    //         id: '3a',
    //         shortLabel: '3A',
    //         badge: 'LICENCE',
    //         badgeClass: 'bg-[#EBF5EF] text-[#0F5A3B]',
    //         description: '3ème Année'
    //     }
    // ];

    const handleSelect = (niveau: Niveau) => {
        setSelectedNiveau(niveau.id);
        updateNiveau(niveau.id, niveau.name);
    };

    const handleNext = () => {
        if (selectedNiveau) {
            const niveau = niveaux.find(n => n.id === selectedNiveau);
            if (niveau) {
                updateNiveau(niveau.id, niveau.name);
            }
            navigate('/selection/filiere');
        }
    };
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <p className="text-[#8E8A83]">
                    Chargement des niveaux...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <p className="text-red-500">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Header Section */}
            <div className="mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-[#8E8A83] block mb-2">
                    ÉTAPE 1 / 3
                </span>
                <h1 className="font-syne font-extrabold text-3xl sm:text-5xl text-[#12100E] tracking-tight leading-[1.1] mb-3">
                    Quel est votre <br /> niveau d'études ?
                </h1>
                <p className="text-[#8E8A83] font-medium text-sm sm:text-base">
                    Sélectionnez votre année pour accéder aux cours correspondants
                </p>
            </div>

            {/* Grid of 3 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
                {niveaux.map((niveau) => {
                    const isSelected = selectedNiveau === niveau.id;
                    return (
                        <div
                            key={niveau.id}
                            onClick={() => handleSelect(niveau)}
                            className={`
                                relative cursor-pointer rounded-2xl p-6 sm:p-7 transition-all duration-200 min-h-[140px] flex flex-col justify-between
                                ${isSelected
                                    ? 'bg-[#FDF8F5] border-2 border-[#E05320] shadow-sm'
                                    : 'bg-white border border-[#E5E3D8] hover:border-[#D0CEC7] hover:shadow-xs'
                                }
                            `}
                        >
                            {/* Badge Top Right */}
                            <div className="flex justify-end mb-4">
                                <span
                                    className={`
                                        text-[10px] 
                                        font-extrabold 
                                        tracking-wider 
                                        uppercase 
                                        px-2.5 
                                        py-1 
                                        rounded-md
                                        
                                        ${
                                            niveau.order <= 2
                                                ? 'bg-[#FDF0EB] text-[#E05320]'
                                                : 'bg-[#EBF5EF] text-[#0F5A3B]'
                                        }
                                    `}
                                >
                                    {niveau.order === 1 && 'BAC+1'}

                                    {niveau.order === 2 && 'BAC+2'}

                                    {niveau.order === 3 && 'LICENCE'}

                                    {niveau.order > 3 &&
                                        `NIVEAU ${niveau.order}`}
                                </span>
                            </div>

                            {/* Number & Description */}
                            <div>
                                <h3 className="font-syne font-extrabold text-4xl sm:text-5xl text-[#12100E] tracking-tight mb-1">
                                    {niveau.order}
                                </h3>
                                <p className="text-[#8E8A83] font-semibold text-xs sm:text-sm">
                                    {niveau.name}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Right CTA Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!selectedNiveau}
                    className={`
                        px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer shadow-md inline-flex items-center gap-2
                        ${selectedNiveau
                            ? 'bg-[#E05320] hover:bg-[#C94518] text-white hover:shadow-lg'
                            : 'bg-[#E6E4DD] text-[#8E8A83] cursor-not-allowed shadow-none'
                        }
                    `}
                >
                    <span>Choisir ma filière</span>
                    <span>→</span>
                </button>
            </div>
        </div>
    );
};

export default NiveauSelection;