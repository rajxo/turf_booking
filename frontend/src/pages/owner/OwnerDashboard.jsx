import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { turfAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [turfs, setTurfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:5000';

    useEffect(() => {
        fetchMyTurfs();
    }, []);

    const fetchMyTurfs = async () => {
        try {
            const response = await turfAPI.getMyTurfs();
            setTurfs(response.data.data.turfs || []);
        } catch (error) {
            toast.error('Failed to fetch turfs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (turfId) => {
        if (!window.confirm('Are you sure you want to delete this turf?')) return;

        try {
            await turfAPI.delete(turfId);
            toast.success('Turf deleted successfully');
            fetchMyTurfs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete turf');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="flex items-center text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-sm">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Approved
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Pending
                    </span>
                );
            case 'rejected':
                return (
                    <span className="flex items-center text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    // Stats
    const stats = {
        total: turfs.length,
        approved: turfs.filter((t) => t.status === 'approved').length,
        pending: turfs.filter((t) => t.status === 'pending').length,
        rejected: turfs.filter((t) => t.status === 'rejected').length,
    };

    if (loading) {
        return <Loading text="Loading dashboard..." />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
                </div>
                <Link
                    to="/owner/turfs/new"
                    className="flex items-center bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Turf
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-gray-600">Total Turfs</div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-3xl font-bold text-emerald-600">{stats.approved}</div>
                    <div className="text-gray-600">Approved</div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                    <div className="text-gray-600">Rejected</div>
                </div>
            </div>

            {/* Turfs List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold">My Turfs</h2>
                </div>

                {turfs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🏟️</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No turfs yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Start by adding your first turf
                        </p>
                        <Link
                            to="/owner/turfs/new"
                            className="inline-flex items-center bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Your First Turf
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {turfs.map((turf) => (
                            <div key={turf._id} className="p-6 hover:bg-gray-50">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Image */}
                                    <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={
                                                turf.coverImage
                                                    ? `${API_URL}/${turf.coverImage}`
                                                    : 'https://placehold.co/200x150/10b981/white?text=🏟️'
                                            }
                                            alt={turf.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {turf.name}
                                                    </h3>
                                                    {getStatusBadge(turf.status)}
                                                </div>
                                                <p className="text-gray-600 text-sm mb-2">
                                                    {turf.location}, {turf.city}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {turf.sportsTypes?.map((sport) => (
                                                        <span
                                                            key={sport}
                                                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs capitalize"
                                                        >
                                                            {sport}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-emerald-600">
                                                    ₹{turf.pricePerHour}/hr
                                                </div>
                                            </div>
                                        </div>

                                        {turf.rejectionReason && (
                                            <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                                                <strong>Rejection reason:</strong> {turf.rejectionReason}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 mt-4">
                                    <Link
                                        to={`/turfs/${turf._id}`}
                                        className="flex items-center text-gray-600 hover:text-emerald-600 text-sm"
                                    >
                                        <EyeIcon className="h-4 w-4 mr-1" />
                                        View
                                    </Link>
                                    <Link
                                        to={`/owner/turfs/${turf._id}/bookings`}
                                        className="flex items-center text-gray-600 hover:text-emerald-600 text-sm"
                                    >
                                        📅 Bookings
                                    </Link>
                                    <Link
                                        to={`/owner/turfs/${turf._id}/edit`}
                                        className="flex items-center text-gray-600 hover:text-blue-600 text-sm"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-1" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(turf._id)}
                                        className="flex items-center text-red-600 hover:text-red-700 text-sm"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-1" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
