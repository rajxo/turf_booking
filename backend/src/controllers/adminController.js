const User = require('../models/User');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
const getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const [totalUsers, totalOwners, totalTurfs, pendingTurfs, approvedTurfs, totalBookings, totalReviews] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'owner' }),
            Turf.countDocuments(),
            Turf.countDocuments({ status: 'pending' }),
            Turf.countDocuments({ status: 'approved' }),
            Booking.countDocuments(),
            Review.countDocuments(),
        ]);

        // Get booking stats
        const bookingStats = await Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                },
            },
        ]);

        // Get recent bookings
        const recentBookings = await Booking.find()
            .populate('user', 'name email')
            .populate('turf', 'name location')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get pending turfs for quick action
        const pendingTurfsList = await Turf.find({ status: 'pending' })
            .populate('owner', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers + totalOwners,
                    users: totalUsers,
                    owners: totalOwners,
                },
                turfs: {
                    total: totalTurfs,
                    pending: pendingTurfs,
                    approved: approvedTurfs,
                    rejected: totalTurfs - pendingTurfs - approvedTurfs,
                },
                bookings: {
                    total: totalBookings,
                    stats: bookingStats,
                },
                reviews: {
                    total: totalReviews,
                },
                recentBookings,
                pendingTurfsList,
            },
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard stats.',
        });
    }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Filter by role
        const query = {};
        if (req.query.role && ['user', 'owner', 'admin'].includes(req.query.role)) {
            query.role = req.query.role;
        }

        // Search by name or email
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        const users = await User.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            data: { users },
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users.',
        });
    }
};

/**
 * @desc    Get all turfs for admin (including pending)
 * @route   GET /api/admin/turfs
 * @access  Private (Admin only)
 */
const getAllTurfsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Filter by status
        const query = {};
        if (req.query.status && ['pending', 'approved', 'rejected'].includes(req.query.status)) {
            query.status = req.query.status;
        }

        // Search by name or city
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { city: { $regex: req.query.search, $options: 'i' } },
            ];
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
        console.error('Get all turfs admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching turfs.',
        });
    }
};

/**
 * @desc    Approve a turf
 * @route   PUT /api/admin/turfs/:id/approve
 * @access  Private (Admin only)
 */
const approveTurf = async (req, res) => {
    try {
        const { id } = req.params;

        const turf = await Turf.findById(id);

        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        if (turf.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Turf is already approved.',
            });
        }

        turf.status = 'approved';
        turf.rejectionReason = null;
        await turf.save();

        await turf.populate('owner', 'name email');

        res.status(200).json({
            success: true,
            message: 'Turf approved successfully.',
            data: { turf },
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid turf ID.',
            });
        }

        console.error('Approve turf error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while approving turf.',
        });
    }
};

/**
 * @desc    Reject a turf
 * @route   PUT /api/admin/turfs/:id/reject
 * @access  Private (Admin only)
 */
const rejectTurf = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const turf = await Turf.findById(id);

        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        if (turf.status === 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Turf is already rejected.',
            });
        }

        turf.status = 'rejected';
        turf.rejectionReason = reason || 'No reason provided';
        await turf.save();

        await turf.populate('owner', 'name email');

        res.status(200).json({
            success: true,
            message: 'Turf rejected successfully.',
            data: { turf },
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid turf ID.',
            });
        }

        console.error('Reject turf error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting turf.',
        });
    }
};

/**
 * @desc    Get booking statistics report
 * @route   GET /api/admin/reports/bookings
 * @access  Private (Admin only)
 */
const getBookingReport = async (req, res) => {
    try {
        // Date range filter
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        // Set time to start/end of day
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Bookings by day
        const bookingsByDay = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' },
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        ]);

        // Bookings by status
        const bookingsByStatus = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                },
            },
        ]);

        // Top turfs by bookings
        const topTurfs = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'booked',
                },
            },
            {
                $group: {
                    _id: '$turf',
                    bookingCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                },
            },
            { $sort: { bookingCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'turfs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'turfDetails',
                },
            },
            { $unwind: '$turfDetails' },
            {
                $project: {
                    _id: 1,
                    bookingCount: 1,
                    totalRevenue: 1,
                    turfName: '$turfDetails.name',
                    turfCity: '$turfDetails.city',
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                dateRange: {
                    startDate,
                    endDate,
                },
                bookingsByDay,
                bookingsByStatus,
                topTurfs,
            },
        });
    } catch (error) {
        console.error('Get booking report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating booking report.',
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getAllTurfsAdmin,
    approveTurf,
    rejectTurf,
    getBookingReport,
};
