const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 4.5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },

    tour: {
        //parent referencing
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},

// Virtual populate to get the user details in the review
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


// Prevent duplicate reviews by the same user for the same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const Review = mongoose.model('review', reviewSchema);
module.exports = Review;