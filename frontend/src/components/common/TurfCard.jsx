import { Link } from 'react-router-dom';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';

const TurfCard = ({ turf }) => {
    const API_URL = 'http://localhost:5000';

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={turf.coverImage ? `${API_URL}/${turf.coverImage}` : 'https://placehold.co/400x300/10b981/white?text=🏟️'}
                    alt={turf.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {turf.sportsTypes && turf.sportsTypes.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {turf.sportsTypes.slice(0, 2).map((sport) => (
                            <span
                                key={sport}
                                className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full capitalize"
                            >
                                {sport}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {turf.name}
                </h3>

                <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="truncate">{turf.location}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-400" />
                        <span className="ml-1 font-medium">
                            {turf.averageRating?.toFixed(1) || 'New'}
                        </span>
                        <span className="text-gray-400 text-sm ml-1">
                            ({turf.totalReviews || 0})
                        </span>
                    </div>
                    <div className="text-emerald-600 font-bold">
                        ₹{turf.pricePerHour}/hr
                    </div>
                </div>

                <Link
                    to={`/turfs/${turf._id}`}
                    className="block w-full text-center bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default TurfCard;
