import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../../../services/api/userService';
import type { UserRole } from '../../../services/api/userService';
import type { UserProfile } from '../../../context/AuthContext';
import { CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

const AdminUsersPage: React.FC = () => {
    const { token } = useAuth();

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const loadUsers = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await userService.getAll(token);
            setUsers(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur chargement utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [token]);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleChangeRole = async (userId: string, newRole: UserRole) => {
        if (!token) return;
        try {
            await userService.changeRole(userId, newRole, token);
            showSuccess(`Rôle modifié en ${newRole}`);
            loadUsers();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur modification rôle');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!token || !confirm('Supprimer cet utilisateur ?')) return;
        try {
            await userService.deleteUser(userId, token);
            showSuccess('Utilisateur supprimé');
            loadUsers();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur suppression utilisateur');
        }
    };

    return (
        <div className="bg-white border border-[#E5E3D8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
                <h2 className="font-syne font-extrabold text-xl text-[#12100E]">Gestion des Utilisateurs & Rôles</h2>
                <p className="text-xs text-[#8E8A83] mt-1">Consultez la liste des étudiants et attribuez les rôles `DELEGATE` ou `ADMIN`</p>
            </div>

            {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>{error}</span>
                </div>
            )}

            {successMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>{successMsg}</span>
                </div>
            )}

            {loading ? (
                <p className="text-xs text-[#8E8A83] text-center py-6">Chargement...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#E5E3D8] text-[#8E8A83] uppercase tracking-wider">
                                <th className="py-3 px-4">Utilisateur</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Rôle Actuel</th>
                                <th className="py-3 px-4 text-right">Modifier le Rôle</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EEE6]">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-[#FAF9F5]">
                                    <td className="py-3.5 px-4 font-bold text-[#12100E]">
                                        {u.firstName} {u.lastName}
                                    </td>
                                    <td className="py-3.5 px-4 text-[#8E8A83]">{u.email}</td>
                                    <td className="py-3.5 px-4">
                                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                            u.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700'
                                                : u.role === 'DELEGATE'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                                            className="px-3 py-1.5 rounded-lg border border-[#E5E3D8] text-xs font-bold bg-white focus:outline-none focus:border-[#E05320] cursor-pointer"
                                        >
                                            <option value="STUDENT">STUDENT</option>
                                            <option value="DELEGATE">DELEGATE</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
