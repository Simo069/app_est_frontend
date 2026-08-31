import { API_URL, getAuthHeaders } from '../../api/config';
import type { Semestre } from './semestreService';

export interface ModuleItem {
    id: string;
    name: string;
    code: string | null;
    semestreId: string;
    semestre?: Semestre;
    createdAt?: string;
    updatedAt?: string;
}

export const moduleService = {
    async getAll(): Promise<ModuleItem[]> {
        const res = await fetch(`${API_URL}/modules`);
        if (!res.ok) throw new Error('Impossible de récupérer la liste des modules');
        return res.json();
    },

    async getBySemestreId(semestreId: string): Promise<ModuleItem[]> {
        const res = await fetch(`${API_URL}/modules/semestre/${semestreId}`);
        if (!res.ok) throw new Error('Impossible de récupérer les modules pour ce semestre');
        return res.json();
    },

    async getById(id: string): Promise<ModuleItem> {
        const res = await fetch(`${API_URL}/modules/${id}`);
        if (!res.ok) throw new Error('Module introuvable');
        return res.json();
    },

    async create(data: { name: string; code?: string | null; semestreId: string }, token?: string | null): Promise<ModuleItem> {
        const res = await fetch(`${API_URL}/modules`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erreur lors de la création du module');
        }
        return res.json();
    },

    async update(id: string, data: { name?: string; code?: string | null; semestreId?: string }, token?: string | null): Promise<ModuleItem> {
        const res = await fetch(`${API_URL}/modules/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erreur lors de la modification du module');
        }
        return res.json();
    },

    async delete(id: string, token?: string | null): Promise<void> {
        const res = await fetch(`${API_URL}/modules/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token)
        });
        if (!res.ok) throw new Error('Impossible de supprimer ce module');
    }
};
