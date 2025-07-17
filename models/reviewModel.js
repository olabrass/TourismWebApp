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
        ref: 'Tours',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        //parent referencing
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

// reviewSchema.pre(/^find/, function(next){
//     this.populate({
//         path: 'tour',
//         select:'name'
//     })
//     next();
// })

//Pre hook to populate the user details in the review
// This will run before any find query on the review model
reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
});


// Static method to calculate average ratings for a tour
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    // If there are no reviews, set default values
    // If there are reviews, update the tour with the calculated ratings
    if (stats.length > 0) {
        await mongoose.model('Tours').findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
        //Set default values if no reviews exist
    } else {
        await mongoose.model('Tours').findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewSchema.post('save', function() {
    // this points to the current review
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {  
    
    // this points to the current query
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    // this points to the current review
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

// Prevent duplicate reviews by the same user for the same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const Review = mongoose.model('review', reviewSchema);
module.exports = Review;