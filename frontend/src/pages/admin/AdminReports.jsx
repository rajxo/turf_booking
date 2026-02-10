import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { CalendarIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

const AdminReports = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {};
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;

            const response = await adminAPI.getBookingReport(params);
            setReport(response.data.data);
        } catch (error) {
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        fetchReport();
    };

    if (loading) {
        return <Loading text="Loading reports..." />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Booking Reports</h1>
                <p className="text-gray-600 mt-1">View booking statistics</p>
            </div>

            {/* Date Filter */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                        Apply Filter
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setDateRange({ startDate: '', endDate: '' });
                            fetchReport();
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Clear
                    </button>
                </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Total Bookings</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {report?.totalBookings || 0}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <CalendarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Completed</p>
                            <p className="text-3xl font-bold text-emerald-600 mt-1">
                                {report?.completedBookings || 0}
                            </p>
                        </div>
                        <div className="bg-emerald-100 p-3 rounded-lg">
                            <CalendarIcon className="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Cancelled</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">
                                {report?.cancelledBookings || 0}
                            </p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-lg">
                            <CalendarIcon className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings by Status */}
            {report?.bookingsByStatus && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Bookings by Status</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {report.bookingsByStatus.map((item) => (
                            <div key={item._id} className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                                <p className="text-gray-600 capitalize">{item._id}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Turfs */}
            {report?.topTurfs && report.topTurfs.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Booked Turfs</h3>
                    <div className="space-y-3">
                        {report.topTurfs.map((turf, index) => (
                            <div
                                key={turf._id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-semibold">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium">{turf.turfName || 'Unknown Turf'}</p>
                                        <p className="text-sm text-gray-500">{turf.count} bookings</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
