import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (roleFilter) params.role = roleFilter;
            const response = await adminAPI.getUsers(params);
            setUsers(response.data.data.users || []);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-700',
            owner: 'bg-blue-100 text-blue-700',
            user: 'bg-gray-100 text-gray-700',
        };
        return (
            <span className={`${colors[role]} px-3 py-1 rounded-full text-sm capitalize`}>
                {role}
            </span>
        );
    };

    if (loading) {
        return <Loading text="Loading users..." />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
                <p className="text-gray-600 mt-1">{users.length} total users</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="">All Roles</option>
                        <option value="user">Users</option>
                        <option value="owner">Owners</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">User</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Role</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <span className="text-emerald-600 font-semibold">
                                                {user.name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No users found</div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
