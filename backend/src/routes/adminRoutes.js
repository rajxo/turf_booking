const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    getAllTurfsAdmin,
    approveTurf,
    rejectTurf,
    getBookingReport,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

// All routes require admin role
router.use(auth);
router.use(authorize('admin'));

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/dashboard', getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/admin/turfs
 * @desc    Get all turfs (including pending)
 * @access  Private (Admin only)
 */
router.get('/turfs', getAllTurfsAdmin);

/**
 * @route   PUT /api/admin/turfs/:id/approve
 * @desc    Approve a turf
 * @access  Private (Admin only)
 */
router.put('/turfs/:id/approve', approveTurf);

/**
 * @route   PUT /api/admin/turfs/:id/reject
 * @desc    Reject a turf
 * @access  Private (Admin only)
 */
router.put('/turfs/:id/reject', rejectTurf);

/**
 * @route   GET /api/admin/reports/bookings
 * @desc    Get booking statistics report
 * @access  Private (Admin only)
 */
router.get('/reports/bookings', getBookingReport);

module.exports = router;
