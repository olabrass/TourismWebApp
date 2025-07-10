const Review = require('./../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');



// Middleware to set tour and user IDs for creating a review
const setTourUserIds = (req, res, next) => {
    // If the tour ID is not provided in the request body, set it from the route parameters
    if (!req.body.tour) req.body.tour = req.params.tourId;
    // If the user ID is not provided in the request body, set it from the authenticated user
    if (!req.body.user) req.body.user = req.user._id;
    next();
};

// CRUD operation functions using factory methods
const getAllReviews = factory.getAll(Review);
const getReview = factory.getOne(Review);
const createReview = factory.createOne(Review);
const updateReview = factory.updateOne(Review);
const deleteReview = factory.deleteOne(Review);

// Exporting the functions
module.exports = {
    createReview,
    getAllReviews,
    deleteReview,
    updateReview,
    setTourUserIds,
    getReview

};
// Note: The above code assumes that the user is authenticated and req.user._id is available.


