import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { niveauService } from '../../../services/api/niveauService';
import { filiereService } from '../../../services/api/filiereService';
import { moduleService } from '../../../services/api/moduleService';
import { userService } from '../../../services/api/userService';

const AdminOverviewPage: React.FC = () => {
    const { token } = useAuth();

    const [counts, setCounts] = useState({
        niveaux: 0,
        filieres: 0,
        modules: 0,
        users: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOverview = async () => {
            try {
                const [nivs, fils, mods, usrs] = await Promise.all([
                    niveauService.getAll().catch(() => []),
                    filiereService.getAll().catch(() => []),
                    moduleService.getAll().catch(() => []),
                    token ? userService.getAll(token).catch(() => []) : Promise.resolve([])
                ]);

                setCounts({
                    niveaux: nivs.length,
                    filieres: fils.length,
                    modules: mods.length,
                    users: usrs.length
                });
            } catch (err) {
                console.error('Erreur chargement overview:', err);
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
    }, [token]);

    if (loading) {
        return <div className="text-center py-10 text-[#8E8A83] text-xs">Chargement des statistiques...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-[#E5E3D8] pb-4">
                <h2 className="font-syne font-extrabold text-2xl text-[#12100E]">Vue d'ensemble du système</h2>
                <p className="text-xs text-[#8E8A83] mt-1">Résumé des entités enregistrées dans la base de données</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 shadow-xs">
                    <div className="text-[#8E8A83] text-xs font-bold uppercase tracking-wider mb-2">Niveaux d'études</div>
                    <div className="font-syne font-extrabold text-3xl text-[#12100E]">{counts.niveaux}</div>
                </div>

                <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 shadow-xs">
                    <div className="text-[#8E8A83] text-xs font-bold uppercase tracking-wider mb-2">Filières</div>
                    <div className="font-syne font-extrabold text-3xl text-[#12100E]">{counts.filieres}</div>
                </div>

                <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 shadow-xs">
                    <div className="text-[#8E8A83] text-xs font-bold uppercase tracking-wider mb-2">Modules d'enseignement</div>
                    <div className="font-syne font-extrabold text-3xl text-[#12100E]">{counts.modules}</div>
                </div>

                <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 shadow-xs">
                    <div className="text-[#8E8A83] text-xs font-bold uppercase tracking-wider mb-2">Utilisateurs inscrits</div>
                    <div className="font-syne font-extrabold text-3xl text-[#E05320]">{counts.users}</div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverviewPage;
