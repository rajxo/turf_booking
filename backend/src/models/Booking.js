const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        turf: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Turf',
            required: [true, 'Turf is required'],
        },
        date: {
            type: Date,
            required: [true, 'Booking date is required'],
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format'],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format'],
        },
        status: {
            type: String,
            enum: ['booked', 'cancelled'],
            default: 'booked',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'paid', // Assuming frontend demo payment
        },
        totalAmount: {
            type: Number,
            min: [0, 'Amount cannot be negative'],
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient overlap checking
bookingSchema.index({ turf: 1, date: 1, status: 1 });
bookingSchema.index({ user: 1, status: 1 });

// Validate that endTime is after startTime
bookingSchema.pre('validate', function (next) {
    if (this.startTime && this.endTime) {
        const start = this.startTime.split(':').map(Number);
        const end = this.endTime.split(':').map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];

        if (endMinutes <= startMinutes) {
            this.invalidate('endTime', 'End time must be after start time');
        }
    }
    next();
});

// Static method to check for overlapping bookings
bookingSchema.statics.hasOverlap = async function (turfId, date, startTime, endTime, excludeBookingId = null) {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);

    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const query = {
        turf: turfId,
        date: { $gte: dateStart, $lte: dateEnd },
        status: 'booked',
        // Overlap condition: startTime < existingEndTime AND endTime > existingStartTime
        $or: [
            {
                $and: [
                    { startTime: { $lt: endTime } },
                    { endTime: { $gt: startTime } },
                ],
            },
        ],
    };

    // Exclude current booking when updating
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const existingBooking = await this.findOne(query);
    return existingBooking !== null;
};

// Method to calculate total amount
bookingSchema.methods.calculateAmount = function (pricePerHour) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    const hours = (endMinutes - startMinutes) / 60;
    return hours * pricePerHour;
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
