/**
 * Centralized API configuration loaded from Vite environment variables.
 * Can be overridden via .env file (VITE_API_URL).
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function getAuthHeaders(token?: string | null): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}
