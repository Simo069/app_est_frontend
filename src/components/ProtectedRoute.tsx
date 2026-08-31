import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import { Lock, LogIn } from 'lucide-react';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F6F5F0] flex items-center justify-center p-4">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-[#E05320] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-[#8E8A83]">Vérification de la session en cours...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <>
                <div className="min-h-screen bg-[#F6F5F0] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#E5E3D8] shadow-xl text-center space-y-6">
                        <div className="w-16 h-16 bg-[#FDF0EB] text-[#E05320] rounded-2xl flex items-center justify-center mx-auto">
                            <Lock className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="font-syne font-extrabold text-2xl text-[#12100E]">Connexion Requise</h2>
                            <p className="text-xs font-medium text-[#8E8A83] mt-2 leading-relaxed">
                                Vous devez être connecté avec votre compte étudiant EST Casa pour accéder à cet espace réservé (ex: Anciens examens, annales et documents personnels).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => setIsLoginOpen(true)}
                                className="w-full py-3.5 bg-[#E05320] hover:bg-[#C94518] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Se connecter à mon compte</span>
                            </button>

                            <button
                                onClick={() => window.history.back()}
                                className="w-full py-2.5 text-[#8E8A83] hover:text-[#12100E] font-bold text-xs cursor-pointer"
                            >
                                Retour en arrière
                            </button>
                        </div>
                    </div>
                </div>

                <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
            </>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
