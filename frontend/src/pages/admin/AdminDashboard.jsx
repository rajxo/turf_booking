import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import {
    UsersIcon,
    BuildingStorefrontIcon,
    CalendarIcon,
    CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await adminAPI.getDashboard();
            setStats(response.data.data);
        } catch (error) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Loading dashboard..." />;
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: UsersIcon,
            color: 'bg-blue-500',
            link: '/admin/users',
        },
        {
            title: 'Total Turfs',
            value: stats?.totalTurfs || 0,
            icon: BuildingStorefrontIcon,
            color: 'bg-emerald-500',
            link: '/admin/turfs',
        },
        {
            title: 'Total Bookings',
            value: stats?.totalBookings || 0,
            icon: CalendarIcon,
            color: 'bg-purple-500',
            link: '/admin/reports',
        },
        {
            title: 'Pending Turfs',
            value: stats?.pendingTurfs || 0,
            icon: BuildingStorefrontIcon,
            color: 'bg-yellow-500',
            link: '/admin/turfs?status=pending',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome to the admin panel</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => (
                    <Link
                        key={stat.title}
                        to={stat.link}
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/admin/users"
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
                    <p className="text-gray-600">View and manage all registered users</p>
                </Link>
                <Link
                    to="/admin/turfs"
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Turfs</h3>
                    <p className="text-gray-600">Approve or reject pending turfs</p>
                </Link>
                <Link
                    to="/admin/reports"
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">View Reports</h3>
                    <p className="text-gray-600">View booking and revenue reports</p>
                </Link>
            </div>

            {/* Recent Activity could go here */}
        </div>
    );
};

export default AdminDashboard;
