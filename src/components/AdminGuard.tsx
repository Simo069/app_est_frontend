import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AdminGuard: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F6F5F0] flex items-center justify-center p-4">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-[#E05320] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-[#8E8A83]">Vérification des autorisations administrateur...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/modules" replace />;
    }

    if (user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-[#F6F5F0] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#E5E3D8] shadow-xl text-center space-y-5">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="font-syne font-extrabold text-2xl text-[#12100E]">Accès Réservé</h2>
                        <p className="text-xs font-medium text-[#8E8A83] mt-2 leading-relaxed">
                            Vous devez posséder le rôle d'administrateur pour accéder à cette interface de gestion.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/modules')}
                        className="w-full py-3 bg-[#12100E] hover:bg-[#2A2724] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour aux modules</span>
                    </button>
                </div>
            </div>
        );
    }

    return <Outlet />;
};

export default AdminGuard;
