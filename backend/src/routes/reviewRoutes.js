const express = require('express');
const router = express.Router();
const {
    createReview,
    getTurfReviews,
    getMyReviews,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

/**
 * @route   POST /api/reviews
 * @desc    Create a review
 * @access  Private (User only)
 */
router.post('/', auth, authorize('user'), createReview);

/**
 * @route   GET /api/reviews/my-reviews
 * @desc    Get current user's reviews
 * @access  Private (User only)
 */
router.get('/my-reviews', auth, authorize('user'), getMyReviews);

/**
 * @route   GET /api/reviews/turf/:turfId
 * @desc    Get reviews for a turf
 * @access  Public
 */
router.get('/turf/:turfId', getTurfReviews);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private (User only - own review)
 */
router.put('/:id', auth, authorize('user'), updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (User only - own review)
 */
router.delete('/:id', auth, authorize('user'), deleteReview);

module.exports = router;
