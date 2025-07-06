const Review = require('./../models/reviewModel');
const catchAsync = require('../utils/catchAsync');



// Get all reviews
const getAllReviews = catchAsync(async(req, res, next)=>{
    const reviews = await Review.find();
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

//Create new review
const createReview = catchAsync(async(req, res, next)=>{
    const newReview = await Review.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});

// Exporting the functions
module.exports = {
    createReview,
    getAllReviews,
};
// Note: The above code assumes that the user is authenticated and req.user._id is available.


