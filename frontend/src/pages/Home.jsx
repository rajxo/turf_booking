import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { turfAPI } from '../services/api';
import TurfCard from '../components/common/TurfCard';
import Loading from '../components/common/Loading';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Home = () => {
    const [turfs, setTurfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchCity, setSearchCity] = useState('');

    useEffect(() => {
        fetchFeaturedTurfs();
    }, []);

    const fetchFeaturedTurfs = async () => {
        try {
            const response = await turfAPI.getAll({ limit: 6 });
            setTurfs(response.data.data.turfs);
        } catch (error) {
            console.error('Error fetching turfs:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Turfs Listed', value: '500+' },
        { label: 'Cities Covered', value: '50+' },
        { label: 'Happy Users', value: '10K+' },
        { label: 'Bookings Done', value: '50K+' },
    ];

    const sports = [
        { name: 'Football', icon: '⚽', color: 'bg-green-100' },
        { name: 'Cricket', icon: '🏏', color: 'bg-yellow-100' },
        { name: 'Badminton', icon: '🏸', color: 'bg-blue-100' },
        { name: 'Tennis', icon: '🎾', color: 'bg-orange-100' },
        { name: 'Basketball', icon: '🏀', color: 'bg-red-100' },
        { name: 'Volleyball', icon: '🏐', color: 'bg-purple-100' },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
                <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Book Your Perfect
                            <span className="block text-emerald-300">Sports Turf</span>
                        </h1>
                        <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                            Find and book the best sports turfs near you. Football, cricket,
                            badminton, and more - all in one place.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-xl mx-auto">
                            <div className="flex bg-white rounded-full overflow-hidden shadow-lg">
                                <input
                                    type="text"
                                    placeholder="Search by city..."
                                    value={searchCity}
                                    onChange={(e) => setSearchCity(e.target.value)}
                                    className="flex-1 px-6 py-4 text-gray-800 outline-none"
                                />
                                <Link
                                    to={`/turfs${searchCity ? `?city=${searchCity}` : ''}`}
                                    className="bg-emerald-600 text-white px-8 py-4 flex items-center hover:bg-emerald-700 transition-colors"
                                >
                                    <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                                    Search
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-12 -mt-8">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sports Categories */}
            <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    Choose Your Sport
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {sports.map((sport) => (
                        <Link
                            key={sport.name}
                            to={`/turfs?sports=${sport.name.toLowerCase()}`}
                            className={`${sport.color} rounded-xl p-6 text-center hover:scale-105 transition-transform`}
                        >
                            <div className="text-4xl mb-2">{sport.icon}</div>
                            <div className="font-medium text-gray-800">{sport.name}</div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Turfs */}
            <section className="bg-gray-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Featured Turfs</h2>
                        <Link
                            to="/turfs"
                            className="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <Loading text="Loading turfs..." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {turfs.map((turf) => (
                                <TurfCard key={turf._id} turf={turf} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-emerald-600 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Own a Sports Turf?</h2>
                    <p className="text-emerald-100 mb-8">
                        List your turf on TurfBook and reach thousands of sports enthusiasts.
                        Easy management, instant bookings.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-full font-semibold hover:bg-emerald-50 transition-colors"
                    >
                        List Your Turf
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
