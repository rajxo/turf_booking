import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await bookingAPI.getMyBookings();
            setBookings(response.data.data.bookings || []);
        } catch (error) {
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await bookingAPI.cancel(bookingId);
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const getStatusBadge = (booking) => {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (booking.status === 'cancelled') {
            return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">Cancelled</span>;
        }
        if (bookingDate < today) {
            return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Completed</span>;
        }
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Upcoming</span>;
    };

    const isUpcoming = (booking) => {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today && booking.status !== 'cancelled';
    };

    const filteredBookings = bookings.filter((booking) => {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filter) {
            case 'upcoming':
                return bookingDate >= today && booking.status !== 'cancelled';
            case 'past':
                return bookingDate < today && booking.status !== 'cancelled';
            case 'cancelled':
                return booking.status === 'cancelled';
            default:
                return true;
        }
    });

    if (loading) {
        return <Loading text="Loading your bookings..." />;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>

                {/* Filter Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {['all', 'upcoming', 'past', 'cancelled'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === tab
                                    ? 'bg-white text-emerald-600 shadow'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow">
                    <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-600 mb-6">
                        {filter === 'all'
                            ? "You haven't made any bookings yet."
                            : `No ${filter} bookings.`}
                    </p>
                    <Link
                        to="/turfs"
                        className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
                    >
                        Browse Turfs
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex gap-4">
                                        {/* Turf Image */}
                                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={
                                                    booking.turf?.coverImage
                                                        ? `http://localhost:5000/${booking.turf.coverImage}`
                                                        : 'https://placehold.co/100x100/10b981/white?text=🏟️'
                                                }
                                                alt={booking.turf?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Booking Details */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Link
                                                    to={`/turfs/${booking.turf?._id}`}
                                                    className="text-xl font-semibold text-gray-900 hover:text-emerald-600"
                                                >
                                                    {booking.turf?.name || 'Unknown Turf'}
                                                </Link>
                                                {getStatusBadge(booking)}
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                                                <span className="flex items-center">
                                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                                    {new Date(booking.date).toLocaleDateString('en-IN', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                <span className="flex items-center">
                                                    <ClockIcon className="h-4 w-4 mr-1" />
                                                    {booking.startTime} - {booking.endTime}
                                                </span>
                                                <span className="flex items-center">
                                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                                    {booking.turf?.city}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="flex flex-col items-end justify-between">
                                        <div className="text-2xl font-bold text-emerald-600">
                                            ₹{booking.totalAmount}
                                        </div>

                                        {isUpcoming(booking) && (
                                            <button
                                                onClick={() => handleCancel(booking._id)}
                                                className="flex items-center text-red-600 hover:text-red-700 text-sm mt-2"
                                            >
                                                <XCircleIcon className="h-5 w-5 mr-1" />
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
