const user = require('./../model/userModel');
const Review = require('./../model/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


//Create new review
const createReview = catchAsync(async(req, res, next)=>{
    const newReview = await Review.create({
        review: req.body.review,
        rating: req.body.rating,
        tour: req.body.tour,
        user: req.user._id
    });
    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});

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

// Get review by ID
const getReviewById = catchAsync(async(req, res, next)=>{
    const review = await Review.findById(req.params.id);
    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});

// Update review by ID
const updateReview = catchAsync(async(req, res, next)=>{
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});

// Delete review by ID
const deleteReview = catchAsync(async(req, res, next)=>{
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});
// Exporting the functions
module.exports = {
    createReview,
    getAllReviews,
    getReviewById,
    updateReview,
    deleteReview
};
// Note: The above code assumes that the user is authenticated and req.user._id is available.


