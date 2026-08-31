import { API_URL, getAuthHeaders } from '../../api/config';

export interface LoginResponse {
    access_token: string;
}

export interface RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    filiereId?: string;
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const message = err.message || 'Email ou mot de passe incorrect';
            throw new Error(Array.isArray(message) ? message[0] : message);
        }
        return res.json();
    },

    async register(data: RegisterDto): Promise<LoginResponse> {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const message = err.message || "Erreur lors de l'inscription";
            throw new Error(Array.isArray(message) ? message[0] : message);
        }
        return res.json();
    }
};
