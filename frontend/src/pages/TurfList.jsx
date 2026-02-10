import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { turfAPI } from '../services/api';
import TurfCard from '../components/common/TurfCard';
import Loading from '../components/common/Loading';
import {
    FunnelIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const TurfList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [turfs, setTurfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cities, setCities] = useState([]);
    const [sportsTypes, setSportsTypes] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({});

    // Filter state
    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        sports: searchParams.get('sports') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minRating: searchParams.get('minRating') || '',
        search: searchParams.get('search') || '',
    });

    useEffect(() => {
        fetchFiltersData();
    }, []);

    useEffect(() => {
        fetchTurfs();
    }, [searchParams]);

    const fetchFiltersData = async () => {
        try {
            const [citiesRes, sportsRes] = await Promise.all([
                turfAPI.getCities(),
                turfAPI.getSportsTypes(),
            ]);
            setCities(citiesRes.data.data.cities || []);
            setSportsTypes(sportsRes.data.data.sportsTypes || []);
        } catch (error) {
            console.error('Error fetching filter data:', error);
        }
    };

    const fetchTurfs = async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries(searchParams.entries());
            const response = await turfAPI.getAll(params);
            setTurfs(response.data.data.turfs);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching turfs:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            city: '',
            sports: '',
            minPrice: '',
            maxPrice: '',
            minRating: '',
            search: '',
        });
        setSearchParams({});
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Browse Turfs</h1>
                    <p className="text-gray-600 mt-1">
                        {pagination.total || 0} turfs found
                    </p>
                </div>

                {/* Search & Filter Button */}
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="flex-1 md:w-64 relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search turfs..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <FunnelIcon className="h-5 w-5" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Filters</h3>
                        <button onClick={() => setShowFilters(false)}>
                            <XMarkIcon className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <select
                                value={filters.city}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="">All Cities</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city.charAt(0).toUpperCase() + city.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sports */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sport
                            </label>
                            <select
                                value={filters.sports}
                                onChange={(e) => handleFilterChange('sports', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="">All Sports</option>
                                {sportsTypes.map((sport) => (
                                    <option key={sport} value={sport}>
                                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Min Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Price
                            </label>
                            <input
                                type="number"
                                placeholder="₹0"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        {/* Max Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Price
                            </label>
                            <input
                                type="number"
                                placeholder="₹5000"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        {/* Min Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Rating
                            </label>
                            <select
                                value={filters.minRating}
                                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="">Any Rating</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="2">2+ Stars</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Turfs Grid */}
            {loading ? (
                <Loading text="Loading turfs..." />
            ) : turfs.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🏟️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No turfs found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Try adjusting your filters or search criteria
                    </p>
                    <button
                        onClick={clearFilters}
                        className="text-emerald-600 hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {turfs.map((turf) => (
                            <TurfCard key={turf._id} turf={turf} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams);
                                        params.set('page', i + 1);
                                        setSearchParams(params);
                                    }}
                                    className={`px-4 py-2 rounded-lg ${pagination.page === i + 1
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TurfList;
