 const express = require('express');
//  Check tourRoutes for another method of doing this
 const {getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe} = require('../controllers/userController');
 const authController = require('./../controllers/authController');
 
// MOUNTING ROUTER
const router = express.Router();
 router.post('/signup', authController.signup); // User signup route
 router.post('/login', authController.login); // User login route

 // Password management routes
router.post('/forgotPassword', authController.forgotPassword); // Forgot password route
router.patch('/resetPassword/:token', authController.resetPassword); // Reset password route with token
router.patch('/updateMyPassword', authController.protect, authController.updatePassword); // Update password route

//User profile management routes
router.patch('/updateMe', authController.protect, updateMe); // Update user 
router.delete('/deleteMe', authController.protect, deleteMe); // Delete user


 // USERS ROUTE
 router.route('/').get(getAllUsers).post(createUser);
 router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
 module.exports = router;