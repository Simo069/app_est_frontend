import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';

const SelectionGuard: React.FC = () => {
    const { isComplete, isLoading } = useSelection();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isComplete) {
        return <Navigate to="/selection/niveau" replace />;
    }

    return <Outlet />;
};

export default SelectionGuard;

