import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { turfAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SPORTS_OPTIONS = [
    'football',
    'cricket',
    'badminton',
    'tennis',
    'basketball',
    'volleyball',
    'hockey',
];

const TurfForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const API_URL = 'http://localhost:5000';

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        city: '',
        pricePerHour: '',
        openingTime: '06:00',
        closingTime: '22:00',
        description: '',
        amenities: '',
        sportsTypes: [],
    });

    const [coverImage, setCoverImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [existingCover, setExistingCover] = useState('');
    const [existingGallery, setExistingGallery] = useState([]);

    useEffect(() => {
        if (isEdit) {
            fetchTurf();
        }
    }, [id]);

    const fetchTurf = async () => {
        try {
            const response = await turfAPI.getById(id);
            const turf = response.data.data.turf;
            setFormData({
                name: turf.name || '',
                location: turf.location || '',
                city: turf.city || '',
                pricePerHour: turf.pricePerHour || '',
                openingTime: turf.openingTime || '06:00',
                closingTime: turf.closingTime || '22:00',
                description: turf.description || '',
                amenities: turf.amenities?.join(', ') || '',
                sportsTypes: turf.sportsTypes || [],
            });
            setExistingCover(turf.coverImage || '');
            setExistingGallery(turf.images || []);
        } catch (error) {
            toast.error('Failed to load turf');
            navigate('/owner');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSportToggle = (sport) => {
        if (formData.sportsTypes.includes(sport)) {
            setFormData({
                ...formData,
                sportsTypes: formData.sportsTypes.filter((s) => s !== sport),
            });
        } else {
            setFormData({
                ...formData,
                sportsTypes: [...formData.sportsTypes, sport],
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = {
                ...formData,
                pricePerHour: Number(formData.pricePerHour),
                amenities: formData.amenities
                    .split(',')
                    .map((a) => a.trim())
                    .filter(Boolean),
            };

            let turfId = id;

            if (isEdit) {
                await turfAPI.update(id, submitData);
                toast.success('Turf updated successfully');
            } else {
                const response = await turfAPI.create(submitData);
                turfId = response.data.data.turf._id;
                toast.success('Turf created successfully. Pending admin approval.');
            }

            // Upload cover image if selected
            if (coverImage) {
                const coverFormData = new FormData();
                coverFormData.append('coverImage', coverImage);
                await turfAPI.uploadCoverImage(turfId, coverFormData);
            }

            // Upload gallery images if selected
            if (galleryImages.length > 0) {
                const galleryFormData = new FormData();
                galleryImages.forEach((img) => {
                    galleryFormData.append('images', img);
                });
                await turfAPI.uploadGalleryImages(turfId, galleryFormData);
            }

            navigate('/owner');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save turf');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGalleryImage = async (index) => {
        if (!window.confirm('Delete this image?')) return;
        try {
            await turfAPI.deleteGalleryImage(id, index);
            toast.success('Image deleted');
            setExistingGallery(existingGallery.filter((_, i) => i !== index));
        } catch (error) {
            toast.error('Failed to delete image');
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-md p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    {isEdit ? 'Edit Turf' : 'Add New Turf'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Turf Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Enter turf name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="e.g. mumbai"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location / Address *
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Full address"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price per Hour (₹) *
                            </label>
                            <input
                                type="number"
                                name="pricePerHour"
                                value={formData.pricePerHour}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="1500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Opening Time
                            </label>
                            <input
                                type="time"
                                name="openingTime"
                                value={formData.openingTime}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Closing Time
                            </label>
                            <input
                                type="time"
                                name="closingTime"
                                value={formData.closingTime}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Sports Types */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sports Types *
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {SPORTS_OPTIONS.map((sport) => (
                                <button
                                    key={sport}
                                    type="button"
                                    onClick={() => handleSportToggle(sport)}
                                    className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${formData.sportsTypes.includes(sport)
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {sport}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Describe your turf..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amenities (comma-separated)
                        </label>
                        <input
                            type="text"
                            name="amenities"
                            value={formData.amenities}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="parking, changing room, water, floodlights"
                        />
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Image
                        </label>
                        <div className="flex items-center gap-4">
                            {(existingCover || coverImage) && (
                                <div className="relative w-32 h-24 rounded-lg overflow-hidden">
                                    <img
                                        src={
                                            coverImage
                                                ? URL.createObjectURL(coverImage)
                                                : `${API_URL}/${existingCover}`
                                        }
                                        alt="Cover"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <label className="flex items-center justify-center w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCoverImage(e.target.files[0])}
                                    className="hidden"
                                />
                                <PhotoIcon className="h-8 w-8 text-gray-400" />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gallery Images (max 5)
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {existingGallery.map((img, index) => (
                                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden">
                                    <img
                                        src={`${API_URL}/${img}`}
                                        alt={`Gallery ${index}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteGalleryImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {galleryImages.map((img, index) => (
                                <div key={`new-${index}`} className="relative w-24 h-24 rounded-lg overflow-hidden">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`New ${index}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setGalleryImages(galleryImages.filter((_, i) => i !== index))
                                        }
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {existingGallery.length + galleryImages.length < 5 && (
                                <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) =>
                                            setGalleryImages([...galleryImages, ...Array.from(e.target.files)])
                                        }
                                        className="hidden"
                                    />
                                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/owner')}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || formData.sportsTypes.length === 0}
                            className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : isEdit ? 'Update Turf' : 'Create Turf'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TurfForm;
