const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            default: null,
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        title: {
            type: String,
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unique review per user per turf
reviewSchema.index({ user: 1, turf: 1 }, { unique: true });
reviewSchema.index({ turf: 1, createdAt: -1 });

// Static method to calculate average rating for a turf
reviewSchema.statics.calculateAverageRating = async function (turfId) {
    const result = await this.aggregate([
        { $match: { turf: turfId } },
        {
            $group: {
                _id: '$turf',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
            },
        },
    ]);

    const Turf = mongoose.model('Turf');

    if (result.length > 0) {
        await Turf.findByIdAndUpdate(turfId, {
            averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
            totalReviews: result[0].totalReviews,
        });
    } else {
        await Turf.findByIdAndUpdate(turfId, {
            averageRating: 0,
            totalReviews: 0,
        });
    }
};

// Update turf rating after saving a review
reviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.turf);
});

// Update turf rating after removing a review
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await doc.constructor.calculateAverageRating(doc.turf);
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
