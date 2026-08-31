import { API_URL } from '../../api/config';

export interface Semestre {
    id: string;
    name: string;
    order: number;
    filiereId: string;
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
    }
};
