import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';

const SelectionLayout: React.FC = () => {
    const location = useLocation();

    const getStep = () => {
        if (location.pathname.includes('/filiere')) return 2;
        if (location.pathname.includes('/modules')) return 3;
        return 1;
    };

    const currentStep = getStep();

    return (
        <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Stepper Navbar */}
                <div className="flex items-center gap-3 sm:gap-4 mb-8">
                    {/* Step 1: NIVEAU */}
                    <div className="flex items-center gap-2">
                        {currentStep > 1 ? (
                            <div className="w-7 h-7 rounded-full bg-[#0F5A3B] text-white flex items-center justify-center shadow-2xs">
                                <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-[#E05320] text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                                1
                            </div>
                        )}
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                            currentStep === 1 ? 'text-[#E05320]' : currentStep > 1 ? 'text-[#0F5A3B]' : 'text-[#8E8A83]'
                        }`}>
                            NIVEAU
                        </span>
                    </div>

                    {/* Connecting Line 1 */}
                    <div className={`h-[2px] w-8 sm:w-16 rounded-full transition-colors ${
                        currentStep >= 2 ? 'bg-[#0F5A3B]' : 'bg-[#D0CEC7]'
                    }`} />

                    {/* Step 2: FILIÈRE */}
                    <div className="flex items-center gap-2">
                        {currentStep > 2 ? (
                            <div className="w-7 h-7 rounded-full bg-[#0F5A3B] text-white flex items-center justify-center shadow-2xs">
                                <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                        ) : currentStep === 2 ? (
                            <div className="w-7 h-7 rounded-full bg-[#E05320] text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                                2
                            </div>
                        ) : (
                            <div className="w-7 h-7 rounded-full border border-[#C8C5BB] text-[#8E8A83] font-bold text-xs flex items-center justify-center bg-[#F7F6F0]">
                                2
                            </div>
                        )}
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                            currentStep === 2 ? 'text-[#E05320]' : currentStep > 2 ? 'text-[#0F5A3B]' : 'text-[#8E8A83]'
                        }`}>
                            FILIÈRE
                        </span>
                    </div>

                    {/* Connecting Line 2 */}
                    <div className={`h-[2px] w-8 sm:w-16 rounded-full transition-colors ${
                        currentStep >= 3 ? 'bg-[#0F5A3B]' : 'bg-[#D0CEC7]'
                    }`} />

                    {/* Step 3: MODULES */}
                    <div className="flex items-center gap-2">
                        {currentStep === 3 ? (
                            <div className="w-7 h-7 rounded-full bg-[#E05320] text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                                3
                            </div>
                        ) : (
                            <div className="w-7 h-7 rounded-full border border-[#C8C5BB] text-[#8E8A83] font-bold text-xs flex items-center justify-center bg-[#F7F6F0]">
                                3
                            </div>
                        )}
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                            currentStep === 3 ? 'text-[#E05320]' : 'text-[#8E8A83]'
                        }`}>
                            MODULES
                        </span>
                    </div>
                </div>

                {/* Outlet for step view */}
                <Outlet />
            </div>
        </div>
    );
};

export default SelectionLayout;