 const express = require('express');
//  Check tourRoutes for another method of doing this
 const {getAllUsers, createUser, getUser, updateUser, deleteUser} = require('../controllers/userController');
 const authController = require('./../controllers/authController');
 
// MOUNTING ROUTER
const router = express.Router();
 router.post('/signup', authController.signup); // User signup route
 router.post('/login', authController.login); // User login route

 // Password management routes
router.post('/forgotPassword', authController.forgotPassword ); // Forgot password route
//router.post('/resetPassword', authController.resetPassword); // Reset password route

 // USERS ROUTE
 router.route('/').get(getAllUsers).post(createUser);
 router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
 module.exports = router;