import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Heart, Sparkles, BookOpen, GraduationCap, Code } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-[#0E0C0A] text-[#8E8A83] border-t border-[#25221F] mt-auto">
            {/* Upper Footer Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Column 1: Brand & App Tagline */}
                    <div className="lg:col-span-5 space-y-4">
                        <Link to="/" className="flex items-center gap-2.5 group w-fit">
                            <div className="w-8 h-8 bg-[#E05320] rounded-lg flex items-center justify-center text-white font-syne font-extrabold text-base shadow-sm group-hover:bg-[#C94518] transition-colors">
                                E
                            </div>
                            <span className="font-syne font-extrabold text-white text-xl tracking-tight">
                                EST <span className="text-[#E05320]">Casa</span>
                            </span>
                        </Link>

                        <p className="text-xs text-[#8E8A83] leading-relaxed max-w-sm">
                            Plateforme académique officielle de partage de ressources pédagogiques, supports de cours, travaux dirigés, travaux pratiques et annales d'examens pour l'École Supérieure de Technologie de Casablanca.
                        </p>

                        {/* Created By Card */}
                        <div className="pt-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-medium text-white shadow-xs">
                                <Code className="w-4 h-4 text-[#E05320]" />
                                <span>Conçu & Développé par <strong className="text-white font-bold">Mohammed Boukhatem</strong></span>
                                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse ml-1" />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Navigation Rapide */}
                    <div className="lg:col-span-3 space-y-3">
                        <h4 className="font-syne font-extrabold text-xs uppercase tracking-widest text-white flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-[#E05320]" />
                            <span>Navigation Rapide</span>
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link to="/selection/niveau" className="hover:text-white transition-colors flex items-center gap-1.5">
                                    <span>› Choisir un Niveau</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/modules" className="hover:text-white transition-colors flex items-center gap-1.5">
                                    <span>› Consulter les Modules</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/examens" className="hover:text-white transition-colors flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-[#E05320]" />
                                    <span>Anciens Examens</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="hover:text-white transition-colors flex items-center gap-1.5">
                                    <span>› Mon Profil Étudiant</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact & Réseaux Sociaux */}
                    <div className="lg:col-span-4 space-y-4">
                        <h4 className="font-syne font-extrabold text-xs uppercase tracking-widest text-white flex items-center gap-2">
                            <GraduationCap className="w-3.5 h-3.5 text-[#E05320]" />
                            <span>Contact & Réseaux</span>
                        </h4>
                        <p className="text-xs text-[#8E8A83]">
                            Restez connecté avec le développeur pour toute suggestion, feedback ou contribution au projet.
                        </p>

                        <div className="flex flex-col space-y-2.5 text-xs">
                            {/* Instagram Link */}
                            <a
                                href="https://www.instagram.com/mohammed_boukhatem/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-[#E05320]/10 hover:border-[#E05320]/30 border border-white/10 text-white transition-all group"
                            >
                                <svg className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                                <span className="font-semibold text-xs text-slate-200 group-hover:text-white">@mohammed_boukhatem</span>
                            </a>

                            {/* LinkedIn Link */}
                            <a
                                href="https://www.linkedin.com/in/mohammed-boukhatem-a84574220/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-[#E05320]/10 hover:border-[#E05320]/30 border border-white/10 text-white transition-all group"
                            >
                                <svg className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                                <span className="font-semibold text-xs text-slate-200 group-hover:text-white">Mohammed Boukhatem</span>
                            </a>

                            {/* Email Link */}
                            <a
                                href="mailto:mohammedboukhatem069@gmail.com"
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-[#E05320]/10 hover:border-[#E05320]/30 border border-white/10 text-white transition-all group"
                            >
                                <Mail className="w-4 h-4 text-[#E05320] group-hover:scale-110 transition-transform" />
                                <span className="font-semibold text-xs text-slate-200 group-hover:text-white">mohammedboukhatem069@gmail.com</span>
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="border-t border-[#1C1A17] bg-[#0A0807] py-6 px-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8A83]">
                    <div>
                        © {new Date().getFullYear()} <strong className="text-white">EST Casa</strong>. Tous droits réservés.
                    </div>
                    <div className="flex items-center gap-1">
                        <span>Application créée par</span>
                        <a
                            href="https://www.linkedin.com/in/mohammed-boukhatem-a84574220/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E05320] font-bold hover:underline"
                        >
                            Mohammed Boukhatem
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
