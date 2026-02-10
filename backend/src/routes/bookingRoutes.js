const express = require('express');
const router = express.Router();
const {
    bookSlot,
    getMyBookings,
    cancelBooking,
    getBookingById,
    getTurfBookings,
    getTurfAvailability,
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

/**
 * @route   GET /api/bookings/availability/:turfId
 * @desc    Get turf availability for a date
 * @access  Public
 */
router.get('/availability/:turfId', getTurfAvailability);

/**
 * @route   POST /api/bookings
 * @desc    Book a turf slot
 * @access  Private (User only)
 */
router.post('/', auth, authorize('user'), bookSlot);

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Get current user's bookings
 * @access  Private (User only)
 */
router.get('/my-bookings', auth, authorize('user'), getMyBookings);

/**
 * @route   GET /api/bookings/turf/:turfId
 * @desc    Get bookings for a specific turf (for owner)
 * @access  Private (Owner only - own turf)
 */
router.get('/turf/:turfId', auth, authorize('owner'), getTurfBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking by ID
 * @access  Private (User - own booking, or Owner - own turf)
 */
router.get('/:id', auth, getBookingById);

/**
 * @route   PUT /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private (User only - own booking)
 */
router.put('/:id/cancel', auth, authorize('user'), cancelBooking);

module.exports = router;
