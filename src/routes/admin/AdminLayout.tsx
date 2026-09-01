import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    GraduationCap,
    BookOpen,
    Calendar,
    FolderKanban,
    FileText,
    Users,
    Shield
} from 'lucide-react';

const AdminLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#F6F5F0] text-[#12100E]">
            {/* Header Admin Banner */}
            <div className="bg-[#101726] text-white border-b border-slate-800 px-4 sm:px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#E05320] text-white flex items-center justify-center font-syne font-extrabold text-xl shadow-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-syne font-extrabold text-2xl text-white">Dashboard Administrateur</h1>
                                <span className="bg-[#E05320] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                                    ADMIN
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Interface modulaire de gestion du système éducatif EST Casa
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Routes Navigation Tabs */}
            <div className="bg-white border-b border-[#E5E3D8] px-4 sm:px-8 sticky top-16 z-30 shadow-2xs">
                <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 text-xs font-bold">
                    <NavLink
                        to="/admin/overview"
                        className={({ isActive }) => `px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            isActive ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Vue d'ensemble</span>
                    </NavLink>

                    <NavLink
                        to="/admin/niveaux"
                        className={({ isActive }) => `px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            isActive ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Gestion Niveaux</span>
                    </NavLink>

                    <NavLink
                        to="/admin/filieres"
                        className={({ isActive }) => `px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            isActive ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Gestion Filières</span>
                    </NavLink>

                    <NavLink
                        to="/admin/semestres"
                        className={({ isActive }) => `px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            isActive ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Gestion Semestres</span>
                    </NavLink>

                    <NavLink
                        to="/admin/modules"
                        className={({ isActive }) => `px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            isActive ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <FolderKanban className="w-4 h-4" />
                        <span>Gestion Modules</span>
                    </NavLink>

                    <NavLink
                        to="/admin/ressources"
                        className={({ isActive }) => `px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            isActive ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Téléversement Ressources</span>
                    </NavLink>

                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) => `px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            isActive ? 'bg-[#12100E] text-white shadow-xs' : 'text-[#8E8A83] hover:bg-[#F7F6F0]'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Utilisateurs & Rôles</span>
                    </NavLink>
                </div>
            </div>

            {/* Sub-route Outlet */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
