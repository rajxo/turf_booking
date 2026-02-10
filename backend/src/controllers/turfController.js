const Turf = require('../models/Turf');
const { SPORTS_TYPES } = require('../models/Turf');
const { getRelativePath, deleteImageFile } = require('../middleware/imageUpload');

/**
 * @desc    Create a new turf
 * @route   POST /api/turfs
 * @access  Private (Owner only)
 */
const createTurf = async (req, res) => {
    try {
        const { name, location, city, pricePerHour, openingTime, closingTime, description, amenities, sportsTypes } = req.body;

        // Validate required fields
        if (!name || !location || !city || !pricePerHour || !openingTime || !closingTime) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, location, city, pricePerHour, openingTime, and closingTime.',
            });
        }

        // Validate time format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(openingTime) || !timeRegex.test(closingTime)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid time in HH:MM format.',
            });
        }

        // Validate closing time is after opening time
        const openMinutes = parseInt(openingTime.split(':')[0]) * 60 + parseInt(openingTime.split(':')[1]);
        const closeMinutes = parseInt(closingTime.split(':')[0]) * 60 + parseInt(closingTime.split(':')[1]);

        if (closeMinutes <= openMinutes) {
            return res.status(400).json({
                success: false,
                message: 'Closing time must be after opening time.',
            });
        }

        // Create turf
        const turf = await Turf.create({
            name,
            location,
            city,
            pricePerHour,
            openingTime,
            closingTime,
            description: description || '',
            amenities: amenities || [],
            sportsTypes: sportsTypes || ['general'],
            owner: req.user._id,
            status: 'pending', // Requires admin approval
        });

        res.status(201).json({
            success: true,
            message: 'Turf created successfully.',
            data: { turf },
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        console.error('Create turf error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating turf.',
        });
    }
};

/**
 * @desc    Update a turf
 * @route   PUT /api/turfs/:id
 * @access  Private (Owner only - own turf)
 */
const updateTurf = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, city, pricePerHour, openingTime, closingTime, description, amenities, isActive } = req.body;

        // Find turf
        const turf = await Turf.findById(id);

        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        // Check ownership
        if (turf.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this turf.',
            });
        }

        // Validate time if provided
        if (openingTime || closingTime) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            const newOpening = openingTime || turf.openingTime;
            const newClosing = closingTime || turf.closingTime;

            if (!timeRegex.test(newOpening) || !timeRegex.test(newClosing)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide valid time in HH:MM format.',
                });
            }

            const openMinutes = parseInt(newOpening.split(':')[0]) * 60 + parseInt(newOpening.split(':')[1]);
            const closeMinutes = parseInt(newClosing.split(':')[0]) * 60 + parseInt(newClosing.split(':')[1]);

            if (closeMinutes <= openMinutes) {
                return res.status(400).json({
                    success: false,
                    message: 'Closing time must be after opening time.',
                });
            }
        }

        // Update fields
        if (name) turf.name = name;
        if (location) turf.location = location;
        if (city) turf.city = city;
        if (pricePerHour !== undefined) turf.pricePerHour = pricePerHour;
        if (openingTime) turf.openingTime = openingTime;
        if (closingTime) turf.closingTime = closingTime;
        if (description !== undefined) turf.description = description;
        if (amenities) turf.amenities = amenities;
        if (isActive !== undefined) turf.isActive = isActive;

        await turf.save();

        res.status(200).json({
            success: true,
            message: 'Turf updated successfully.',
            data: { turf },
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid turf ID.',
            });
        }

        console.error('Update turf error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating turf.',
        });
    }
};

/**
 * @desc    Soft delete a turf (set isActive to false)
 * @route   DELETE /api/turfs/:id
 * @access  Private (Owner only - own turf)
 */
const deleteTurf = async (req, res) => {
    try {
        const { id } = req.params;

        // Find turf
        const turf = await Turf.findById(id);

        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        // Check ownership
        if (turf.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this turf.',
            });
        }

        // Soft delete
        turf.isActive = false;
        await turf.save();

        res.status(200).json({
            success: true,
            message: 'Turf deleted successfully.',
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid turf ID.',
            });
        }

        console.error('Delete turf error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting turf.',
        });
    }
};

/**
 * @desc    Get all turfs owned by the current owner
 * @route   GET /api/turfs/my-turfs
 * @access  Private (Owner only)
 */
const getOwnerTurfs = async (req, res) => {
    try {
        const turfs = await Turf.find({ owner: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: turfs.length,
            data: { turfs },
        });
    } catch (error) {
        console.error('Get owner turfs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching turfs.',
        });
    }
};

/**
 * @desc    Get all active turfs (public)
 * @route   GET /api/turfs
 * @access  Public
 */
const getAllActiveTurfs = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Search filters - only show approved and active turfs
        const query = { isActive: true, status: 'approved' };

        // Filter by city (exact match, case-insensitive due to lowercase in schema)
        if (req.query.city) {
            query.city = req.query.city.toLowerCase();
        }

        // Filter by location (partial match)
        if (req.query.location) {
            query.location = { $regex: req.query.location, $options: 'i' };
        }

        // Filter by sports types
        if (req.query.sports) {
            const sportsArray = req.query.sports.split(',').map(s => s.trim().toLowerCase());
            query.sportsTypes = { $in: sportsArray };
        }

        if (req.query.minPrice) {
            query.pricePerHour = { ...query.pricePerHour, $gte: parseFloat(req.query.minPrice) };
        }

        if (req.query.maxPrice) {
            query.pricePerHour = { ...query.pricePerHour, $lte: parseFloat(req.query.maxPrice) };
        }

        // Filter by minimum rating
        if (req.query.minRating) {
            query.averageRating = { $gte: parseFloat(req.query.minRating) };
        }

        const turfs = await Turf.find(query)
            .populate('owner', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Turf.countDocuments(query);

        res.status(200).json({
            success: true,
            count: turfs.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            data: { turfs },
        });
    } catch (error) {
        console.error('Get all turfs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching turfs.',
        });
    }
};

/**
 * @desc    Get single turf by ID
 * @route   GET /api/turfs/:id
 * @access  Public
 */
const getTurfById = async (req, res) => {
    try {
        const { id } = req.params;

        const turf = await Turf.findOne({ _id: id, isActive: true }).populate('owner', 'name email');

        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: { turf },
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid turf ID.',
            });
        }

        console.error('Get turf by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching turf.',
        });
    }
};

/**
 * @desc    Get all available cities (for dropdown)
 * @route   GET /api/turfs/cities
 * @access  Public
 */
const getAllCities = async (req, res) => {
    try {
        // Get distinct cities from active turfs
        const cities = await Turf.distinct('city', { isActive: true });

        // Sort cities alphabetically and capitalize first letter for display
        const formattedCities = cities
            .sort()
            .map(city => ({
                value: city,
                label: city.charAt(0).toUpperCase() + city.slice(1)
            }));

        res.status(200).json({
            success: true,
            count: formattedCities.length,
            data: { cities: formattedCities },
        });
    } catch (error) {
        console.error('Get all cities error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching cities.',
        });
    }
};

/**
 * @desc    Get all available sports types
 * @route   GET /api/turfs/sports-types
 * @access  Public
 */
const getSportsTypes = async (req, res) => {
    try {
        const formattedSports = SPORTS_TYPES.map(sport => ({
            value: sport,
            label: sport.charAt(0).toUpperCase() + sport.slice(1),
        }));

        res.status(200).json({
            success: true,
            count: formattedSports.length,
            data: { sportsTypes: formattedSports },
        });
    } catch (error) {
        console.error('Get sports types error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching sports types.',
        });
    }
};

/**
 * @desc    Upload turf cover image
 * @route   POST /api/turfs/:id/cover-image
 * @access  Private (Owner only - own turf)
 */
const uploadCoverImage = async (req, res) => {
    try {
        const { id } = req.params;

        const turf = await Turf.findById(id);

        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        // Check ownership
        if (turf.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this turf.',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image.',
            });
        }

        // Delete old cover image if exists
        if (turf.coverImage) {
            deleteImageFile(turf.coverImage);
        }

        // Update cover image
        turf.coverImage = getRelativePath(req.file.filename);
        await turf.save();

        res.status(200).json({
            success: true,
            message: 'Cover image uploaded successfully.',
            data: { coverImage: turf.coverImage },
        });
    } catch (error) {
        console.error('Upload cover image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading cover image.',
        });
    }
};

/**
 * @desc    Upload turf gallery images
 * @route   POST /api/turfs/:id/images
 * @access  Private (Owner only - own turf)
 */
const uploadGalleryImages = async (req, res) => {
    try {
        const { id } = req.params;

        const turf = await Turf.findById(id);

        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        // Check ownership
        if (turf.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this turf.',
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one image.',
            });
        }

        // Check if total images will exceed 5
        if (turf.images.length + req.files.length > 5) {
            return res.status(400).json({
                success: false,
                message: `Maximum 5 images allowed. You have ${turf.images.length} images, can add ${5 - turf.images.length} more.`,
            });
        }

        // Add new images
        const newImages = req.files.map(file => getRelativePath(file.filename));
        turf.images.push(...newImages);
        await turf.save();

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully.',
            data: { images: turf.images },
        });
    } catch (error) {
        console.error('Upload gallery images error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading images.',
        });
    }
};

/**
 * @desc    Delete a gallery image
 * @route   DELETE /api/turfs/:id/images/:imageIndex
 * @access  Private (Owner only - own turf)
 */
const deleteGalleryImage = async (req, res) => {
    try {
        const { id, imageIndex } = req.params;
        const index = parseInt(imageIndex, 10);

        const turf = await Turf.findById(id);

        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        // Check ownership
        if (turf.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this turf.',
            });
        }

        if (index < 0 || index >= turf.images.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image index.',
            });
        }

        // Delete file
        deleteImageFile(turf.images[index]);

        // Remove from array
        turf.images.splice(index, 1);
        await turf.save();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully.',
            data: { images: turf.images },
        });
    } catch (error) {
        console.error('Delete gallery image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting image.',
        });
    }
};

module.exports = {
    createTurf,
    updateTurf,
    deleteTurf,
    getOwnerTurfs,
    getAllActiveTurfs,
    getTurfById,
    getAllCities,
    getSportsTypes,
    uploadCoverImage,
    uploadGalleryImages,
    deleteGalleryImage,
};
