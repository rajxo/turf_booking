import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout, isAuthenticated, isOwner, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Browse Turfs', href: '/turfs' },
    ];

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-2xl">🏟️</span>
                            <span className="text-xl font-bold text-emerald-600">TurfBook</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600"
                                >
                                    <UserCircleIcon className="h-8 w-8" />
                                    <span className="font-medium">{user?.name}</span>
                                </button>

                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                        {isAdmin && (
                                            <Link
                                                to="/admin"
                                                className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        {isOwner && (
                                            <Link
                                                to="/owner"
                                                className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                Owner Dashboard
                                            </Link>
                                        )}
                                        {!isOwner && !isAdmin && (
                                            <Link
                                                to="/my-bookings"
                                                className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                My Bookings
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-emerald-600 font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600"
                        >
                            {mobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-4 py-3 space-y-3">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="block text-gray-600 hover:text-emerald-600 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className="block text-gray-600 hover:text-emerald-600"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}
                                {isOwner && (
                                    <Link
                                        to="/owner"
                                        className="block text-gray-600 hover:text-emerald-600"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Owner Dashboard
                                    </Link>
                                )}
                                {!isOwner && !isAdmin && (
                                    <Link
                                        to="/my-bookings"
                                        className="block text-gray-600 hover:text-emerald-600"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        My Bookings
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="block text-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block text-gray-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block text-emerald-600 font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
