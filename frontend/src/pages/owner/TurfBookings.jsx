import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI, turfAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

const TurfBookings = () => {
    const { id } = useParams();
    const [turf, setTurf] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [turfRes, bookingsRes] = await Promise.all([
                turfAPI.getById(id),
                bookingAPI.getTurfBookings(id),
            ]);
            setTurf(turfRes.data.data.turf);
            setBookings(bookingsRes.data.data.bookings || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = selectedDate
        ? bookings.filter(
            (b) => new Date(b.date).toISOString().split('T')[0] === selectedDate
        )
        : bookings;

    const getStatusBadge = (booking) => {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (booking.status === 'cancelled') {
            return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Cancelled</span>;
        }
        if (bookingDate < today) {
            return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">Completed</span>;
        }
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">Upcoming</span>;
    };

    if (loading) {
        return <Loading text="Loading bookings..." />;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/owner"
                    className="inline-flex items-center text-gray-600 hover:text-emerald-600 mb-4"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    Bookings for {turf?.name}
                </h1>
                <p className="text-gray-600">{bookings.length} total bookings</p>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Filter by date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    {selectedDate && (
                        <button
                            onClick={() => setSelectedDate('')}
                            className="text-emerald-600 hover:underline text-sm"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-600">
                        {selectedDate ? 'No bookings for selected date.' : 'No bookings yet.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">User</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Time</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Amount</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {booking.user?.name || 'Unknown'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.user?.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-gray-600">
                                            <CalendarIcon className="h-4 w-4 mr-1" />
                                            {new Date(booking.date).toLocaleDateString('en-IN', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-gray-600">
                                            <ClockIcon className="h-4 w-4 mr-1" />
                                            {booking.startTime} - {booking.endTime}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-emerald-600">
                                            ₹{booking.totalAmount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(booking)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TurfBookings;
