import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import {
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

const AdminTurfs = () => {
    const [searchParams] = useSearchParams();
    const [turfs, setTurfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [rejectModal, setRejectModal] = useState({ open: false, turfId: null });
    const [rejectReason, setRejectReason] = useState('');
    const API_URL = 'http://localhost:5000';

    useEffect(() => {
        fetchTurfs();
    }, [statusFilter]);

    const fetchTurfs = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            const response = await adminAPI.getTurfs(params);
            setTurfs(response.data.data.turfs || []);
        } catch (error) {
            toast.error('Failed to load turfs');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (turfId) => {
        try {
            await adminAPI.approveTurf(turfId);
            toast.success('Turf approved successfully');
            fetchTurfs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a reason');
            return;
        }
        try {
            await adminAPI.rejectTurf(rejectModal.turfId, rejectReason);
            toast.success('Turf rejected');
            setRejectModal({ open: false, turfId: null });
            setRejectReason('');
            fetchTurfs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            approved: 'bg-emerald-100 text-emerald-700',
            pending: 'bg-yellow-100 text-yellow-700',
            rejected: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`${styles[status]} px-3 py-1 rounded-full text-sm capitalize`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return <Loading text="Loading turfs..." />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Turfs</h1>
                <p className="text-gray-600 mt-1">{turfs.length} turfs found</p>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex gap-2">
                    {['', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status || 'all'}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${statusFilter === status
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Turfs Grid */}
            {turfs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🏟️</div>
                    <h3 className="text-xl font-semibold text-gray-900">No turfs found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {turfs.map((turf) => (
                        <div key={turf._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="flex">
                                <div className="w-40 h-32 flex-shrink-0">
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
                                <div className="p-4 flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900">{turf.name}</h3>
                                        {getStatusBadge(turf.status)}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        {turf.location}, {turf.city}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Owner: {turf.owner?.name || 'Unknown'}
                                    </p>
                                    <div className="text-lg font-bold text-emerald-600">
                                        ₹{turf.pricePerHour}/hr
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-4 py-3 bg-gray-50 flex justify-end gap-3">
                                <a
                                    href={`/turfs/${turf._id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center text-gray-600 hover:text-emerald-600 text-sm"
                                >
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    View
                                </a>
                                {turf.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(turf._id)}
                                            className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm"
                                        >
                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setRejectModal({ open: true, turfId: turf._id })}
                                            className="flex items-center text-red-600 hover:text-red-700 text-sm"
                                        >
                                            <XCircleIcon className="h-4 w-4 mr-1" />
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Reject Turf</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none mb-4"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setRejectModal({ open: false, turfId: null });
                                    setRejectReason('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Reject Turf
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTurfs;
