import { API_URL, getAuthHeaders } from '../../api/config';
import type { Niveau } from './niveauService';

export interface Filiere {
    id: string;
    name: string;
    code: string | null;
    niveauId: string;
    niveau?: Niveau;
    createdAt?: string;
    updatedAt?: string;
}

export const filiereService = {
    async getAll(): Promise<Filiere[]> {
        const res = await fetch(`${API_URL}/filiere`);
        if (!res.ok) throw new Error('Impossible de récupérer les filières');
        return res.json();
    },

    async getByNiveauId(niveauId: string): Promise<Filiere[]> {
        const res = await fetch(`${API_URL}/filiere/niveau/${niveauId}`);
        if (!res.ok) throw new Error('Impossible de récupérer les filières pour ce niveau');
        return res.json();
    },

    async getById(id: string): Promise<Filiere> {
        const res = await fetch(`${API_URL}/filiere/${id}`);
        if (!res.ok) throw new Error('Filière introuvable');
        return res.json();
    },

    async create(data: { name: string; code?: string | null; niveauId: string }, token?: string | null): Promise<Filiere> {
        const res = await fetch(`${API_URL}/filiere`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erreur lors de la création de la filière');
        }
        return res.json();
    },

    async update(id: string, data: { name?: string; code?: string | null; niveauId?: string }, token?: string | null): Promise<Filiere> {
        const res = await fetch(`${API_URL}/filiere/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erreur lors de la modification de la filière');
        }
        return res.json();
    },

    async delete(id: string, token?: string | null): Promise<void> {
        const res = await fetch(`${API_URL}/filiere/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token)
        });
        if (!res.ok) throw new Error('Impossible de supprimer cette filière');
    }
};
