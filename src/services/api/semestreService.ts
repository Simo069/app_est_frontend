import { API_URL, getAuthHeaders } from '../../api/config';
import type { Filiere } from './filiereService';

export interface Semestre {
    id: string;
    name: string;
    order: number;
    filiereId: string;
    filiere?: Filiere;
    createdAt?: string;
    updatedAt?: string;
}

export const semestreService = {
    async getAll(): Promise<Semestre[]> {
        const res = await fetch(`${API_URL}/semestre`);
        if (!res.ok) throw new Error('Impossible de récupérer les semestres');
        return res.json();
    },

    async getByFiliereId(filiereId: string): Promise<Semestre[]> {
        const res = await fetch(`${API_URL}/semestre/filiere/${filiereId}`);
        if (!res.ok) throw new Error('Impossible de récupérer les semestres pour cette filière');
        return res.json();
    },

    async getById(id: string): Promise<Semestre> {
        const res = await fetch(`${API_URL}/semestre/${id}`);
        if (!res.ok) throw new Error('Semestre introuvable');
        return res.json();
    },

    async create(data: { name: string; order: number; filiereId: string }, token?: string | null): Promise<Semestre> {
        const res = await fetch(`${API_URL}/semestre`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const message = err.message || 'Erreur lors de la création du semestre';
            throw new Error(Array.isArray(message) ? message[0] : message);
        }
        return res.json();
    },

    async update(id: string, data: { name?: string; order?: number; filiereId?: string }, token?: string | null): Promise<Semestre> {
        const res = await fetch(`${API_URL}/semestre/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const message = err.message || 'Erreur lors de la modification du semestre';
            throw new Error(Array.isArray(message) ? message[0] : message);
        }
        return res.json();
    },

    async delete(id: string, token?: string | null): Promise<void> {
        const res = await fetch(`${API_URL}/semestre/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token)
        });
        if (!res.ok) throw new Error('Impossible de supprimer ce semestre');
    }
};
