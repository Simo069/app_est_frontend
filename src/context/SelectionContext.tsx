import React, { createContext, useState, useContext, useEffect } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

export interface UserSelection {
    niveau: string;
    filiere: string;
    niveauLabel: string;
    filiereLabel: string;
}

interface SelectionContextType {
    selection: UserSelection | null;
    setSelection: (selection: UserSelection) => void;
    clearSelection: () => void;
    isComplete: boolean;
    isLoading: boolean;
    updateNiveau: (niveau: string, niveauLabel: string) => void;
    updateFiliere: (filiere: string, filiereLabel: string) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);
export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selection, setSelectionState] = useState<UserSelection | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const saved = localStorage.getItem('est_casa_selection');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSelectionState(parsed);
            } catch (error) {
                console.error('Erreur de chargement:', error);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (selection) {
            localStorage.setItem('est_casa_selection', JSON.stringify(selection));
        }
    }, [selection]);

    // Rediriger vers la sélection si nécessaire
    useEffect(() => {
        if (!isLoading) {
            const isSelectionRoute = location.pathname.startsWith('/selection');
            const isAuthRoute = location.pathname.startsWith('/auth');

            // Si pas de sélection et pas sur une route de sélection ou d'auth
            if (!selection && !isSelectionRoute && !isAuthRoute) {
                navigate('/selection/niveau');
            }
        }
    }, [selection, isLoading, location, navigate]);

    const setSelection = (newSelection: UserSelection) => {
        setSelectionState(newSelection);
    };

    const clearSelection = () => {
        setSelectionState(null);
        localStorage.removeItem('est_casa_selection');
        navigate('/selection/niveau');
    };

    const updateNiveau = (niveau: string, niveauLabel: string) => {
        setSelectionState(prev => {
            const newSelection = {
                ...prev,
                niveau,
                niveauLabel,
                // Reset filiere when niveau changes
                filiere: '',
                filiereLabel: ''
            } as UserSelection;
            return newSelection;
        });
    };

    const updateFiliere = (filiere: string, filiereLabel: string) => {
        setSelectionState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                filiere,
                filiereLabel
            };
        });
    };

    const isComplete = selection !== null &&
        !!selection.niveau &&
        !!selection.filiere;

    return (
        <SelectionContext.Provider value={{
            selection,
            setSelection,
            clearSelection,
            isComplete,
            isLoading,
            updateNiveau,
            updateFiliere
        }}>
            {children}
        </SelectionContext.Provider>
    );
}

export const useSelection = () => {
    const context = useContext(SelectionContext);
    if (!context) {
        throw new Error('useSelection must be used within SelectionProvider');
    }
    return context;
};