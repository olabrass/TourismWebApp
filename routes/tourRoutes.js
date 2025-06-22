const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// MOUNTING ROUTER
const router = express.Router();

// PARAM MIDDLEWARE, WORKS WITH ONLY ROUTE THAT HAS ID
router.param('id', tourController.checkId);

// REFACTORING ROUTE FOR TOURS
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTour);
router.route('/').get(authController.protect, tourController.getAllTour).post(tourController.createTour);
module.exports = router;    
router.route('/:id').get(tourController.getTourById).patch(tourController.updateTour).delete(tourController.deleteTour);     