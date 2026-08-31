import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/api/authService';
import type { RegisterDto } from '../services/api/authService';
import { userService } from '../services/api/userService';

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'DELEGATE' | 'ADMIN';
    filiereId?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

interface JwtPayload {
    sub: string;
    email: string;
    role: 'STUDENT' | 'DELEGATE' | 'ADMIN';
    exp?: number;
}

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterDto) => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'est_casa_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Fetch User Profile using Token
    const fetchUserProfile = async (authToken: string): Promise<UserProfile | null> => {
        try {
            const profile = await userService.getMe(authToken);
            return profile;
        } catch (error) {
            console.error('Erreur lors de la récupération du profil utilisateur:', error);
        }

        // Fallback to JWT payload decoding if /me fails
        try {
            const decoded: JwtPayload = jwtDecode(authToken);
            return {
                id: decoded.sub,
                email: decoded.email,
                firstName: decoded.email.split('@')[0].split('.')[0] || 'Étudiant',
                lastName: decoded.email.split('@')[0].split('.')[1] || 'EST',
                role: decoded.role
            };
        } catch {
            return null;
        }
    };

    // Initialize Auth State on Mount
    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem(TOKEN_KEY);
            if (savedToken) {
                try {
                    const decoded: JwtPayload = jwtDecode(savedToken);
                    // Check token expiration
                    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                        localStorage.removeItem(TOKEN_KEY);
                    } else {
                        setToken(savedToken);
                        const profile = await fetchUserProfile(savedToken);
                        setUser(profile);
                    }
                } catch {
                    localStorage.removeItem(TOKEN_KEY);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    // Login Method
    const login = async (email: string, password: string) => {
        const res = await authService.login(email, password);
        const jwtToken = res.access_token;

        localStorage.setItem(TOKEN_KEY, jwtToken);
        setToken(jwtToken);

        const profile = await fetchUserProfile(jwtToken);
        setUser(profile);
    };

    // Register Method
    const register = async (data: RegisterDto) => {
        const res = await authService.register(data);
        const jwtToken = res.access_token;

        localStorage.setItem(TOKEN_KEY, jwtToken);
        setToken(jwtToken);

        const profile = await fetchUserProfile(jwtToken);
        setUser(profile);
    };

    // Update Profile Method
    const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
        if (!token) throw new Error('Vous devez être connecté.');

        const updatedUser = await userService.updateMe(data, token);
        setUser(updatedUser);
        return updatedUser;
    };

    // Logout Method
    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                login,
                register,
                updateProfile,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
