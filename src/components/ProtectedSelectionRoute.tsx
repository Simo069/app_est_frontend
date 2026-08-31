import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';

interface ProtectedSelectionRouteProps {
    required: 'niveau' | 'filiere';
}

const ProtectedSelectionRoute: React.FC<
    ProtectedSelectionRouteProps
> = ({ required }) => {

    const { selection } = useSelection();

    if (required === 'niveau' && !selection?.niveau) {
        return < Navigate to="/selection/niveau" replace />;
    }

    if (required === 'filiere') {
        if (!selection?.niveau) {
            return 
                < Navigate to="/selection/niveau" replace />;
            
        }

        if (!selection?.filiere) {
            return 
                <Navigate to="/selection/filiere" replace />;
            
        }
    }

    return <Outlet />;
};

export default ProtectedSelectionRoute;