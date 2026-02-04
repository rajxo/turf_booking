const Review = require('../models/Review');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');

/**
 * @desc    Create a review
 * @route   POST /api/reviews
 * @access  Private (User only)
 */
const createReview = async (req, res) => {
    try {
        const { turfId, rating, title, comment, bookingId } = req.body;

        // Validate required fields
        if (!turfId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Please provide turfId and rating.',
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5.',
            });
        }

        // Check if turf exists
        const turf = await Turf.findById(turfId);
        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        // Check if user has already reviewed this turf
        const existingReview = await Review.findOne({
            user: req.user._id,
            turf: turfId,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this turf.',
            });
        }

        // Optionally verify booking exists
        let booking = null;
        if (bookingId) {
            booking = await Booking.findOne({
                _id: bookingId,
                user: req.user._id,
                turf: turfId,
            });

            if (!booking) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid booking reference.',
                });
            }
        }

        // Create review
        const review = await Review.create({
            user: req.user._id,
            turf: turfId,
            booking: bookingId || null,
            rating,
            title: title || '',
            comment: comment || '',
        });

        await review.populate('user', 'name');

        res.status(201).json({
            success: true,
            message: 'Review created successfully.',
            data: { review },
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this turf.',
            });
        }

        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating review.',
        });
    }
};

/**
 * @desc    Get reviews for a turf
 * @route   GET /api/reviews/turf/:turfId
 * @access  Public
 */
const getTurfReviews = async (req, res) => {
    try {
        const { turfId } = req.params;

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Sort by rating or date
        const sortBy = req.query.sortBy === 'rating' ? { rating: -1 } : { createdAt: -1 };

        const reviews = await Review.find({ turf: turfId })
            .populate('user', 'name')
            .skip(skip)
            .limit(limit)
            .sort(sortBy);

        const total = await Review.countDocuments({ turf: turfId });

        // Get rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { turf: require('mongoose').Types.ObjectId.createFromHexString(turfId) } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
        ]);

        res.status(200).json({
            success: true,
            count: reviews.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            ratingDistribution,
            data: { reviews },
        });
    } catch (error) {
        console.error('Get turf reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews.',
        });
    }
};

/**
 * @desc    Get current user's reviews
 * @route   GET /api/reviews/my-reviews
 * @access  Private (User only)
 */
const getMyReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ user: req.user._id })
            .populate('turf', 'name location coverImage')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments({ user: req.user._id });

        res.status(200).json({
            success: true,
            count: reviews.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            data: { reviews },
        });
    } catch (error) {
        console.error('Get my reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews.',
        });
    }
};

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private (User only - own review)
 */
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title, comment } = req.body;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.',
            });
        }

        // Check ownership
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review.',
            });
        }

        // Update fields
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5.',
                });
            }
            review.rating = rating;
        }
        if (title !== undefined) review.title = title;
        if (comment !== undefined) review.comment = comment;

        await review.save();

        await review.populate('user', 'name');

        res.status(200).json({
            success: true,
            message: 'Review updated successfully.',
            data: { review },
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID.',
            });
        }

        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating review.',
        });
    }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (User only - own review)
 */
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.',
            });
        }

        // Check ownership
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review.',
            });
        }

        await Review.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully.',
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID.',
            });
        }

        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting review.',
        });
    }
};

module.exports = {
    createReview,
    getTurfReviews,
    getMyReviews,
    updateReview,
    deleteReview,
};
