const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const { sendBookingConfirmation, sendBookingCancellation } = require('../utils/email');

/**
 * @desc    Book a turf slot
 * @route   POST /api/bookings
 * @access  Private (User only)
 */
const bookSlot = async (req, res) => {
    try {
        const { turfId, date, startTime, endTime } = req.body;

        // Validate required fields
        if (!turfId || !date || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'Please provide turfId, date, startTime, and endTime.',
            });
        }

        // Validate time format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid time in HH:MM format.',
            });
        }

        // Validate endTime is after startTime
        const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

        if (endMinutes <= startMinutes) {
            return res.status(400).json({
                success: false,
                message: 'End time must be after start time.',
            });
        }

        // Find turf
        const turf = await Turf.findById(turfId);

        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        // Check if turf is active
        if (!turf.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This turf is not available for booking.',
            });
        }

        // Validate booking date is not in the past
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book slots in the past.',
            });
        }

        // If booking is for today, check if start time is not in the past
        if (bookingDate.getTime() === today.getTime()) {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            if (startMinutes < currentMinutes) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot book slots in the past.',
                });
            }
        }

        // Validate booking is within turf operating hours
        const turfOpenMinutes = parseInt(turf.openingTime.split(':')[0]) * 60 + parseInt(turf.openingTime.split(':')[1]);
        const turfCloseMinutes = parseInt(turf.closingTime.split(':')[0]) * 60 + parseInt(turf.closingTime.split(':')[1]);

        if (startMinutes < turfOpenMinutes || endMinutes > turfCloseMinutes) {
            return res.status(400).json({
                success: false,
                message: `Booking must be within turf operating hours: ${turf.openingTime} - ${turf.closingTime}.`,
            });
        }

        // Check for overlapping bookings
        const hasOverlap = await Booking.hasOverlap(turfId, date, startTime, endTime);

        if (hasOverlap) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please choose a different time.',
            });
        }

        // Calculate total amount
        const hours = (endMinutes - startMinutes) / 60;
        const totalAmount = hours * turf.pricePerHour;

        // Create booking
        const booking = await Booking.create({
            user: req.user._id,
            turf: turfId,
            date: bookingDate,
            startTime,
            endTime,
            status: 'booked',
            paymentStatus: 'paid', // Demo payment assumed
            totalAmount,
        });

        // Populate turf details
        await booking.populate('turf', 'name location pricePerHour');

        // Send booking confirmation email (non-blocking)
        sendBookingConfirmation({
            to: req.user.email,
            userName: req.user.name,
            booking: {
                _id: booking._id,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                totalAmount: booking.totalAmount,
            },
            turf: {
                name: turf.name,
                location: turf.location,
            },
        }).catch(err => console.error('Email sending failed:', err));

        res.status(201).json({
            success: true,
            message: 'Booking created successfully.',
            data: { booking },
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

        console.error('Book slot error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating booking.',
        });
    }
};

/**
 * @desc    Get current user's bookings
 * @route   GET /api/bookings/my-bookings
 * @access  Private (User only)
 */
const getMyBookings = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Filter by status
        const query = { user: req.user._id };
        if (req.query.status && ['booked', 'cancelled'].includes(req.query.status)) {
            query.status = req.query.status;
        }

        const bookings = await Booking.find(query)
            .populate('turf', 'name location pricePerHour openingTime closingTime')
            .skip(skip)
            .limit(limit)
            .sort({ date: -1, startTime: -1 });

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            count: bookings.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            data: { bookings },
        });
    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bookings.',
        });
    }
};

/**
 * @desc    Cancel a booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private (User only - own booking)
 */
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // Find booking
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found.',
            });
        }

        // Check ownership
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking.',
            });
        }

        // Check if already cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled.',
            });
        }

        // Check if booking date is in the past
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel past bookings.',
            });
        }

        // If booking is for today, check if start time has already passed
        if (bookingDate.getTime() === today.getTime()) {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const startMinutes = parseInt(booking.startTime.split(':')[0]) * 60 + parseInt(booking.startTime.split(':')[1]);

            if (startMinutes <= currentMinutes) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot cancel a booking that has already started.',
                });
            }
        }

        // Cancel booking
        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded'; // Demo refund
        await booking.save();

        await booking.populate('turf', 'name location');

        // Send booking cancellation email (non-blocking)
        sendBookingCancellation({
            to: req.user.email,
            userName: req.user.name,
            booking: {
                _id: booking._id,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                totalAmount: booking.totalAmount,
            },
            turf: {
                name: booking.turf.name,
                location: booking.turf.location,
            },
        }).catch(err => console.error('Email sending failed:', err));

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully.',
            data: { booking },
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID.',
            });
        }

        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling booking.',
        });
    }
};

/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private (User only - own booking)
 */
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
            .populate('turf', 'name location pricePerHour openingTime closingTime owner')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found.',
            });
        }

        // Check if user owns the booking or is the turf owner
        const isTurfOwner = booking.turf.owner.toString() === req.user._id.toString();
        const isBookingOwner = booking.user._id.toString() === req.user._id.toString();

        if (!isBookingOwner && !isTurfOwner) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking.',
            });
        }

        res.status(200).json({
            success: true,
            data: { booking },
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID.',
            });
        }

        console.error('Get booking by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching booking.',
        });
    }
};

/**
 * @desc    Get bookings for a specific turf (for owner)
 * @route   GET /api/bookings/turf/:turfId
 * @access  Private (Owner only - own turf)
 */
const getTurfBookings = async (req, res) => {
    try {
        const { turfId } = req.params;

        // Find turf and check ownership
        const turf = await Turf.findById(turfId);

        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        if (turf.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view bookings for this turf.',
            });
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Filter by date range if provided
        const query = { turf: turfId };

        if (req.query.startDate) {
            query.date = { ...query.date, $gte: new Date(req.query.startDate) };
        }

        if (req.query.endDate) {
            query.date = { ...query.date, $lte: new Date(req.query.endDate) };
        }

        if (req.query.status && ['booked', 'cancelled'].includes(req.query.status)) {
            query.status = req.query.status;
        }

        const bookings = await Booking.find(query)
            .populate('user', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ date: -1, startTime: -1 });

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            count: bookings.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            data: { bookings },
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid turf ID.',
            });
        }

        console.error('Get turf bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching turf bookings.',
        });
    }
};

/**
 * @desc    Get turf availability for a date
 * @route   GET /api/bookings/availability/:turfId
 * @access  Public
 */
const getTurfAvailability = async (req, res) => {
    try {
        const { turfId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a date.',
            });
        }

        // Find turf
        const Turf = require('../models/Turf');
        const turf = await Turf.findById(turfId);

        if (!turf) {
            return res.status(404).json({
                success: false,
                message: 'Turf not found.',
            });
        }

        // Parse turf operating hours
        const openingMinutes = parseInt(turf.openingTime.split(':')[0]) * 60 + parseInt(turf.openingTime.split(':')[1]);
        const closingMinutes = parseInt(turf.closingTime.split(':')[0]) * 60 + parseInt(turf.closingTime.split(':')[1]);

        // Parse the requested date
        const requestedDate = new Date(date);
        requestedDate.setHours(0, 0, 0, 0);

        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        // Get all bookings for this turf on this date
        const Booking = require('../models/Booking');
        const bookings = await Booking.find({
            turf: turfId,
            date: { $gte: requestedDate, $lte: dateEnd },
            status: 'booked',
        }).sort({ startTime: 1 });

        // Generate hourly slots
        const slots = [];
        for (let minutes = openingMinutes; minutes < closingMinutes; minutes += 60) {
            const startHour = Math.floor(minutes / 60);
            const endHour = Math.floor((minutes + 60) / 60);

            const startTime = `${String(startHour).padStart(2, '0')}:00`;
            const endTime = `${String(endHour).padStart(2, '0')}:00`;

            // Check if this slot overlaps with any booking
            const isBooked = bookings.some(booking => {
                const bookingStart = parseInt(booking.startTime.split(':')[0]) * 60 + parseInt(booking.startTime.split(':')[1]);
                const bookingEnd = parseInt(booking.endTime.split(':')[0]) * 60 + parseInt(booking.endTime.split(':')[1]);
                return minutes < bookingEnd && (minutes + 60) > bookingStart;
            });

            // Check if slot is in the past (for today's date)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let isPast = false;

            if (requestedDate.getTime() === today.getTime()) {
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                isPast = minutes < currentMinutes;
            } else if (requestedDate < today) {
                isPast = true;
            }

            slots.push({
                startTime,
                endTime,
                status: isPast ? 'past' : (isBooked ? 'booked' : 'available'),
            });
        }

        res.status(200).json({
            success: true,
            data: {
                turf: {
                    id: turf._id,
                    name: turf.name,
                    openingTime: turf.openingTime,
                    closingTime: turf.closingTime,
                    pricePerHour: turf.pricePerHour,
                },
                date: requestedDate.toISOString().split('T')[0],
                slots,
            },
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid turf ID.',
            });
        }

        console.error('Get turf availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching availability.',
        });
    }
};

module.exports = {
    bookSlot,
    getMyBookings,
    cancelBooking,
    getBookingById,
    getTurfBookings,
    getTurfAvailability,
};
