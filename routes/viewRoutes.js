const express = require('express');
const router = express.Router();
const viewsController = require('../controllers/viewsController');


// Route to render the overview page
// Routes to pug templates
router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm)

module.exports = router;
// This file defines the routes for rendering views in the application.