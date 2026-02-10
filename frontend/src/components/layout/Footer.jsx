import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-2xl">🏟️</span>
                            <span className="text-xl font-bold">TurfBook</span>
                        </div>
                        <p className="text-gray-400 max-w-md">
                            Book your favorite sports turf in minutes. Find the best turfs near you
                            for football, cricket, badminton, and more.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/turfs" className="text-gray-400 hover:text-emerald-400">
                                    Browse Turfs
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-gray-400 hover:text-emerald-400">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-gray-400 hover:text-emerald-400">
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>📧 support@turfbook.com</li>
                            <li>📞 +91 98765 43210</li>
                            <li>📍 Mumbai, India</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} TurfBook. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
