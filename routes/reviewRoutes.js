const express = require('express');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');


// MOUNTING ROUTER
// This will allow us to merge the params from the parent route (tourId) to this route
const router = express.Router({mergeParams:true});

// This middleware will protect all routes below it, because middleware is executed sequentially
router.use(authController.protect);

router.route('/')
.get(reviewController.getAllReviews)
.post(authController.protect, 
authController.restrictTo('user'), 
reviewController.setTourUserIds,
reviewController.createReview);

router.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('user', 'admin'),
reviewController.updateReview)
.delete(authController.restrictTo('user', 'admin'),
reviewController.deleteReview);


module.exports = router; 