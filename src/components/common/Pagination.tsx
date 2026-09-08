import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 8, 10, 20],
}) => {
    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E3D8] text-xs">
            <div className="flex items-center gap-3 text-[#8E8A83]">
                <span>
                    Affichage de <strong className="text-[#12100E] font-extrabold">{startItem}</strong> à <strong className="text-[#12100E] font-extrabold">{endItem}</strong> sur <strong className="text-[#12100E] font-extrabold">{totalItems}</strong> élément(s)
                </span>

                {onPageSizeChange && (
                    <div className="flex items-center gap-1.5 ml-2 border-l border-[#E5E3D8] pl-3">
                        <span>Par page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="bg-white border border-[#E5E3D8] rounded-lg px-2 py-1 font-bold text-[#12100E] focus:outline-none focus:border-[#E05320] cursor-pointer"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-[#E5E3D8] bg-white hover:bg-[#FAF9F5] text-[#12100E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Page précédente"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            disabled={page === '...'}
                            className={`min-w-[32px] h-[32px] px-2 rounded-lg font-bold transition-all ${
                                page === currentPage
                                    ? 'bg-[#E05320] text-white shadow-xs'
                                    : page === '...'
                                    ? 'cursor-default text-[#8E8A83]'
                                    : 'border border-[#E5E3D8] bg-white hover:bg-[#FAF9F5] text-[#12100E] cursor-pointer'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-[#E5E3D8] bg-white hover:bg-[#FAF9F5] text-[#12100E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Page suivante"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};
