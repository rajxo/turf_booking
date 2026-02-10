import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { turfAPI, bookingAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import {
    MapPinIcon,
    ClockIcon,
    StarIcon,
    CalendarIcon,
} from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const TurfDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isUser } = useAuth();
    const API_URL = 'http://localhost:5000';

    const [turf, setTurf] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);

    // Booking state
    const [selectedDate, setSelectedDate] = useState('');
    const [availability, setAvailability] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Review state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, title: '', comment: '' });

    useEffect(() => {
        fetchTurf();
        fetchReviews();
    }, [id]);

    useEffect(() => {
        if (selectedDate && turf) {
            fetchAvailability();
        }
    }, [selectedDate]);

    const fetchTurf = async () => {
        try {
            const response = await turfAPI.getById(id);
            setTurf(response.data.data.turf);
        } catch (error) {
            toast.error('Turf not found');
            navigate('/turfs');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await reviewAPI.getTurfReviews(id);
            setReviews(response.data.data.reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const fetchAvailability = async () => {
        try {
            const response = await bookingAPI.getAvailability(id, selectedDate);
            setAvailability(response.data.data.slots || []);
            setSelectedSlots([]);
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    const handleSlotClick = (slot) => {
        if (slot.status !== 'available') return;

        const slotKey = slot.startTime;
        if (selectedSlots.includes(slotKey)) {
            setSelectedSlots(selectedSlots.filter((s) => s !== slotKey));
        } else {
            // Check if slot is adjacent to already selected slots
            const sortedSlots = [...selectedSlots, slotKey].sort();
            let isContiguous = true;
            for (let i = 1; i < sortedSlots.length; i++) {
                const prevHour = parseInt(sortedSlots[i - 1].split(':')[0]);
                const currHour = parseInt(sortedSlots[i].split(':')[0]);
                if (currHour - prevHour !== 1) {
                    isContiguous = false;
                    break;
                }
            }

            if (isContiguous || selectedSlots.length === 0) {
                setSelectedSlots([...selectedSlots, slotKey]);
            } else {
                toast.error('Please select contiguous time slots');
            }
        }
    };

    const calculateTotal = () => {
        return selectedSlots.length * (turf?.pricePerHour || 0);
    };

    const getEndTime = () => {
        if (selectedSlots.length === 0) return '';
        const sorted = [...selectedSlots].sort();
        const lastSlot = sorted[sorted.length - 1];
        const hour = parseInt(lastSlot.split(':')[0]) + 1;
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    const handleBooking = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to book');
            navigate('/login');
            return;
        }

        if (!isUser) {
            toast.error('Only users can book turfs');
            return;
        }

        if (selectedSlots.length === 0) {
            toast.error('Please select at least one time slot');
            return;
        }

        setBookingLoading(true);
        try {
            const sorted = [...selectedSlots].sort();
            await bookingAPI.create({
                turfId: id,
                date: selectedDate,
                startTime: sorted[0],
                endTime: getEndTime(),
            });
            toast.success('Booking confirmed!');
            fetchAvailability();
            setSelectedSlots([]);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !isUser) {
            toast.error('Please login as a user to review');
            return;
        }

        try {
            await reviewAPI.create({
                turfId: id,
                ...reviewData,
            });
            toast.success('Review submitted!');
            setShowReviewForm(false);
            setReviewData({ rating: 5, title: '', comment: '' });
            fetchReviews();
            fetchTurf();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    if (loading) {
        return <Loading text="Loading turf details..." />;
    }

    if (!turf) {
        return <div className="text-center py-16">Turf not found</div>;
    }

    const allImages = [
        turf.coverImage || null,
        ...(turf.images || []),
    ].filter(Boolean);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Images & Details */}
                <div className="lg:col-span-2">
                    {/* Image Gallery */}
                    <div className="relative rounded-xl overflow-hidden mb-6">
                        <img
                            src={allImages[selectedImage] ? `${API_URL}/${allImages[selectedImage]}` : 'https://placehold.co/800x400/10b981/white?text=🏟️'}
                            alt={turf.name}
                            className="w-full h-[400px] object-cover"
                        />
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                                >
                                    <ChevronLeftIcon className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev + 1) % allImages.length)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                                >
                                    <ChevronRightIcon className="h-6 w-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Turf Info */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {turf.sportsTypes?.map((sport) => (
                                <span
                                    key={sport}
                                    className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm capitalize"
                                >
                                    {sport}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-3">{turf.name}</h1>

                        <div className="flex items-center text-gray-600 mb-2">
                            <MapPinIcon className="h-5 w-5 mr-2" />
                            <span>{turf.location}, {turf.city}</span>
                        </div>

                        <div className="flex items-center text-gray-600 mb-4">
                            <ClockIcon className="h-5 w-5 mr-2" />
                            <span>{turf.openingTime} - {turf.closingTime}</span>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center">
                                <StarIcon className="h-6 w-6 text-yellow-400" />
                                <span className="ml-1 text-xl font-semibold">
                                    {turf.averageRating?.toFixed(1) || 'New'}
                                </span>
                                <span className="text-gray-500 ml-1">
                                    ({turf.totalReviews || 0} reviews)
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-emerald-600">
                                ₹{turf.pricePerHour}/hr
                            </div>
                        </div>

                        {turf.description && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-2">About</h3>
                                <p className="text-gray-600">{turf.description}</p>
                            </div>
                        )}

                        {turf.amenities && turf.amenities.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Amenities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {turf.amenities.map((amenity) => (
                                        <span
                                            key={amenity}
                                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                        >
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reviews Section */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Reviews</h2>
                            {isUser && (
                                <button
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    {showReviewForm ? 'Cancel' : 'Write Review'}
                                </button>
                            )}
                        </div>

                        {/* Review Form */}
                        {showReviewForm && (
                            <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                className="text-2xl"
                                            >
                                                <StarIcon
                                                    className={`h-8 w-8 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={reviewData.title}
                                        onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Brief title for your review"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Comment</label>
                                    <textarea
                                        value={reviewData.comment}
                                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                        required
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Share your experience..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                                >
                                    Submit Review
                                </button>
                            </form>
                        )}

                        {/* Reviews List */}
                        {reviews.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review._id} className="border-b border-gray-100 pb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <span className="text-emerald-600 font-semibold">
                                                        {review.user?.name?.charAt(0) || 'U'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{review.user?.name || 'User'}</p>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="font-medium mb-1">{review.title}</h4>
                                        <p className="text-gray-600">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Booking */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <CalendarIcon className="h-6 w-6 mr-2 text-emerald-600" />
                            Book This Turf
                        </h2>

                        {/* Date Picker */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={today}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Time Slots
                                </label>
                                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                                    {availability.map((slot) => (
                                        <button
                                            key={slot.startTime}
                                            onClick={() => handleSlotClick(slot)}
                                            disabled={slot.status !== 'available'}
                                            className={`py-2 px-3 rounded-lg text-sm transition-all ${slot.status === 'booked'
                                                    ? 'bg-red-100 text-red-600 cursor-not-allowed'
                                                    : slot.status === 'past'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : selectedSlots.includes(slot.startTime)
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                }`}
                                        >
                                            {slot.startTime}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-4 mt-3 text-xs">
                                    <span className="flex items-center">
                                        <span className="w-3 h-3 bg-emerald-50 rounded mr-1"></span> Available
                                    </span>
                                    <span className="flex items-center">
                                        <span className="w-3 h-3 bg-red-100 rounded mr-1"></span> Booked
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Booking Summary */}
                        {selectedSlots.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="font-medium mb-2">Booking Summary</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Date: {selectedDate}</p>
                                    <p>
                                        Time: {[...selectedSlots].sort()[0]} - {getEndTime()}
                                    </p>
                                    <p>Duration: {selectedSlots.length} hour(s)</p>
                                </div>
                                <div className="border-t border-gray-200 mt-3 pt-3">
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total</span>
                                        <span className="text-emerald-600">₹{calculateTotal()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleBooking}
                            disabled={bookingLoading || selectedSlots.length === 0}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                        </button>

                        {!isAuthenticated && (
                            <p className="text-center text-sm text-gray-500 mt-3">
                                Please <span className="text-emerald-600 cursor-pointer" onClick={() => navigate('/login')}>login</span> to book
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TurfDetails;
