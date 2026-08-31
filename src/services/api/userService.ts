import { API_URL, getAuthHeaders } from '../../api/config';
import type { UserProfile } from '../../context/AuthContext';

export type UserRole = 'STUDENT' | 'DELEGATE' | 'ADMIN';

export const userService = {
    async getMe(token: string): Promise<UserProfile> {
        const res = await fetch(`${API_URL}/users/me`, {
            headers: getAuthHeaders(token)
        });
        if (!res.ok) throw new Error('Impossible de récupérer le profil utilisateur');
        return res.json();
    },

    async updateMe(data: Partial<UserProfile>, token: string): Promise<UserProfile> {
        const res = await fetch(`${API_URL}/users/me`, {
            method: 'PATCH',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erreur lors de la mise à jour du profil');
        }
        return res.json();
    },

    async getAll(token: string): Promise<UserProfile[]> {
        const res = await fetch(`${API_URL}/users`, {
            headers: getAuthHeaders(token)
        });
        if (!res.ok) throw new Error('Impossible de récupérer la liste des utilisateurs');
        return res.json();
    },

    async changeRole(userId: string, role: UserRole, token: string): Promise<UserProfile> {
        const res = await fetch(`${API_URL}/users/${userId}/role`, {
            method: 'PATCH',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ role })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erreur lors de la modification du rôle');
        }
        return res.json();
    },

    async deleteUser(userId: string, token: string): Promise<void> {
        const res = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token)
        });
        if (!res.ok) throw new Error("Impossible de supprimer cet utilisateur");
    }
};
