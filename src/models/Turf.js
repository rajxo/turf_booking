const mongoose = require('mongoose');

// Available sports types
const SPORTS_TYPES = ['football', 'cricket', 'badminton', 'tennis', 'basketball', 'volleyball', 'hockey', 'general'];

const turfSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Turf name is required'],
            trim: true,
            minlength: [2, 'Turf name must be at least 2 characters'],
            maxlength: [100, 'Turf name cannot exceed 100 characters'],
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
            maxlength: [200, 'Location cannot exceed 200 characters'],
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
            lowercase: true,
            maxlength: [100, 'City cannot exceed 100 characters'],
        },
        pricePerHour: {
            type: Number,
            required: [true, 'Price per hour is required'],
            min: [0, 'Price cannot be negative'],
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Owner is required'],
        },
        openingTime: {
            type: String,
            required: [true, 'Opening time is required'],
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format'],
        },
        closingTime: {
            type: String,
            required: [true, 'Closing time is required'],
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        amenities: {
            type: [String],
            default: [],
        },
        // New fields for images
        coverImage: {
            type: String,
            default: null,
        },
        images: {
            type: [String],
            default: [],
            validate: [arr => arr.length <= 5, 'Maximum 5 images allowed'],
        },
        // New fields for sports types
        sportsTypes: {
            type: [String],
            enum: SPORTS_TYPES,
            default: ['general'],
        },
        // New fields for ratings
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        // New fields for admin approval
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        rejectionReason: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
turfSchema.index({ owner: 1, isActive: 1 });
turfSchema.index({ isActive: 1 });
turfSchema.index({ city: 1, isActive: 1 });
turfSchema.index({ sportsTypes: 1, isActive: 1 });
turfSchema.index({ status: 1 });

// Virtual to check if turf is currently open
turfSchema.virtual('isOpen').get(function () {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return currentTime >= this.openingTime && currentTime <= this.closingTime;
});

// Ensure virtuals are included in JSON output
turfSchema.set('toJSON', { virtuals: true });
turfSchema.set('toObject', { virtuals: true });

const Turf = mongoose.model('Turf', turfSchema);

module.exports = Turf;
module.exports.SPORTS_TYPES = SPORTS_TYPES;
