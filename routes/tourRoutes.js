const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');
// MOUNTING ROUTER
const router = express.Router();

// MOUNTING REVIEW ROUTER
// This will mount the review routes under the tour routes
router.use('/:tourId/reviews', reviewRouter);
// This will allow us to use the review routes under the tour routes, e.g. /tours/:tourId/reviews

// PARAM MIDDLEWARE, WORKS WITH ONLY ROUTE THAT HAS ID
router.param('id', tourController.checkId);

// REFACTORING ROUTE FOR TOURS
router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year')
.get(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
);

router.route('/top-5-cheap')
.get(
    tourController.aliasTopTours, 
    tourController.getAllTour
);


router.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getToursWithin);

router.route('/')
.get(tourController.getAllTour)
.post(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.createTour
);

router.route('/:id')
.get(tourController.getTourById)
.patch(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.updateTour
    )
    .delete(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.deleteTour
    );     



module.exports = router;    