import { API_URL, getAuthHeaders } from '../../api/config';

export interface Niveau {
    id: string;
    name: string;
    order: number;
    createdAt?: string;
    updatedAt?: string;
}

export const niveauService = {
    async getAll(): Promise<Niveau[]> {
        const res = await fetch(`${API_URL}/niveau`);
        if (!res.ok) throw new Error('Impossible de récupérer les niveaux');
        return res.json();
    },

    async getById(id: string): Promise<Niveau> {
        const res = await fetch(`${API_URL}/niveau/${id}`);
        if (!res.ok) throw new Error('Niveau introuvable');
        return res.json();
    },

    async create(data: { name: string; order: number }, token?: string | null): Promise<Niveau> {
        const res = await fetch(`${API_URL}/niveau`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erreur lors de la création du niveau');
        }
        return res.json();
    },

    async update(id: string, data: { name?: string; order?: number }, token?: string | null): Promise<Niveau> {
        const res = await fetch(`${API_URL}/niveau/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erreur lors de la modification du niveau');
        }
        return res.json();
    },

    async delete(id: string, token?: string | null): Promise<void> {
        const res = await fetch(`${API_URL}/niveau/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token)
        });
        if (!res.ok) throw new Error('Impossible de supprimer ce niveau');
    }
};
