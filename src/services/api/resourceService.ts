import { API_URL, getAuthHeaders } from '../../api/config';

export type ResourceTypeEnum = 'COURSE' | 'TD' | 'TP' | 'EXAM';

export interface ResourceApiItem {
    id: string;
    title: string;
    type: ResourceTypeEnum;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    moduleId: string;
    module?: {
        id: string;
        name: string;
        code: string | null;
        semestre?: {
            id: string;
            name: string;
            order: number;
            filiere?: {
                id: string;
                name: string;
                code: string | null;
                niveauId: string;
                niveau?: {
                    id: string;
                    name: string;
                };
            };
        };
    };
    uploadedById: string;
    downloadCount: number;
    createdAt?: string;
}

export const resourceService = {
    async getAll(token?: string | null): Promise<ResourceApiItem[]> {
        const headers = token ? getAuthHeaders(token) : {};
        const res = await fetch(`${API_URL}/ressources`, { headers });
        if (!res.ok) throw new Error('Impossible de récupérer la liste des ressources');
        return res.json();
    },

    async getByModuleAndType(moduleId: string, type?: ResourceTypeEnum): Promise<ResourceApiItem[]> {
        const query = type ? `?type=${type}` : '';
        const res = await fetch(`${API_URL}/ressources/module/${moduleId}${query}`);
        if (!res.ok) throw new Error('Impossible de récupérer les ressources du module');
        return res.json();
    },

    async upload(file: File, title: string, type: ResourceTypeEnum, moduleId: string, token: string): Promise<ResourceApiItem> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('type', type);
        formData.append('moduleId', moduleId);

        const res = await fetch(`${API_URL}/ressources/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erreur lors du téléversement du fichier');
        }
        return res.json();
    },

    async getDownloadUrl(id: string, token?: string | null): Promise<{ url: string }> {
        const headers = token ? getAuthHeaders(token) : {};
        const res = await fetch(`${API_URL}/ressources/${id}/download`, { headers });
        if (!res.ok) throw new Error('Impossible de récupérer le lien de téléchargement');
        return res.json();
    },

    async delete(id: string, token: string): Promise<void> {
        const res = await fetch(`${API_URL}/ressources/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token)
        });
        if (!res.ok) throw new Error('Impossible de supprimer cette ressource');
    }
};
