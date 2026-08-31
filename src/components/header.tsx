import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import { useAuth } from '../context/AuthContext';
import { Key, UserPlus, LogOut, Shield, FileCheck } from 'lucide-react';
import LoginModal from './LoginModal';

const Header: React.FC = () => {
    const { selection } = useSelection();
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const isModulesRoute = location.pathname.startsWith('/modules');
    const isExamsRoute = location.pathname.startsWith('/examens');

    const getInitials = (firstName: string, lastName: string) => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${first}${last}` || 'E';
    };

    return (
        <>
            <header className="w-full bg-[#0E0C0A] border-b border-[#25221F] sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-18">
                        {/* Left: Logo & Navigation */}
                        <div className="flex items-center gap-6">
                            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                                <div className="w-7 h-7 bg-[#E05320] rounded-md flex items-center justify-center text-white font-syne font-extrabold text-sm shadow-sm group-hover:bg-[#C94518] transition-colors">
                                    E
                                </div>
                                <span className="font-syne font-extrabold text-white text-lg tracking-tight">
                                    EST <span className="text-[#E05320]">Casa</span>
                                </span>
                            </Link>

                            {/* Anciens Examens Navigation Link */}
                            {isAuthenticated && (
                                <Link
                                    to="/examens"
                                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        isExamsRoute
                                            ? 'bg-[#E05320] text-white shadow-xs'
                                            : 'text-[#8E8A83] hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <FileCheck className="w-3.5 h-3.5" />
                                    <span>Anciens Examens</span>
                                </Link>
                            )}
                        </div>

                        {/* Breadcrumbs in Header */}
                        {isModulesRoute && selection && (
                            <div className="hidden md:flex items-center gap-2 text-xs text-[#8E8A83] font-medium bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                                <span>{selection.niveauLabel}</span>
                                <span>›</span>
                                <span className="text-white font-semibold">{selection.filiereLabel}</span>
                                <span>›</span>
                                <span className="text-white">Modules</span>
                            </div>
                        )}

                        {/* User Profile & Auth Actions */}
                        <div className="flex items-center gap-3">
                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-3">
                                    {user.role === 'ADMIN' && (
                                        <button
                                            onClick={() => navigate('/admin')}
                                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#E05320] hover:bg-[#C94518] text-white rounded-full text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                                        >
                                            <Shield className="w-3.5 h-3.5" />
                                            <span>Dashboard Admin</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => navigate('/profile')}
                                        title="Voir mon profil"
                                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-all cursor-pointer group"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-[#E05320] text-white flex items-center justify-center font-bold text-[10px] group-hover:scale-105 transition-transform">
                                            {getInitials(user.firstName, user.lastName)}
                                        </div>
                                        <span className="text-xs font-semibold text-white group-hover:text-[#E05320] transition-colors">
                                            {user.firstName} {user.lastName}
                                        </span>
                                        {user.role && user.role !== 'STUDENT' && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B]">
                                                <Shield className="w-2.5 h-2.5" />
                                                {user.role}
                                            </span>
                                        )}
                                    </button>

                                    <button
                                        onClick={logout}
                                        title="Se déconnecter"
                                        className="p-2 bg-white/5 hover:bg-white/10 text-[#8E8A83] hover:text-white rounded-full transition-all text-xs border border-white/10 cursor-pointer"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <button
                                        onClick={() => setIsLoginOpen(true)}
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-full transition-all text-xs font-semibold border border-white/15 cursor-pointer"
                                    >
                                        <Key className="w-3.5 h-3.5 text-[#E05320]" />
                                        <span>Se connecter</span>
                                    </button>

                                    <button
                                        onClick={() => navigate('/register')}
                                        className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E05320] hover:bg-[#C94518] text-white rounded-full transition-all text-xs font-bold cursor-pointer shadow-sm"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        <span>S'inscrire</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Login Modal */}
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    );
};

export default Header;