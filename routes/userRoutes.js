 const express = require('express');
//  Check tourRoutes for another method of doing this
 const {getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe} = require('../controllers/userController');
 const authController = require('./../controllers/authController');
 
// MOUNTING ROUTER
const router = express.Router();
 router.post('/signup', authController.signup); // User signup route
 router.post('/login', authController.login); // User login route

 // Password management routes
router.post('/forgotPassword', authController.forgotPassword); // Forgot password route
router.patch('/resetPassword/:token', authController.resetPassword); // Reset password route with token

//This middleware will protect all routes below it, because middleware is executed sequentially
router.use(authController.protect); 

router.patch('/updateMyPassword', authController.updatePassword); // Update password route

//User profile management routes
router.get('/me', getMe, getUser); // Get current user profile
router.patch('/updateMe', updateMe); // Update user 
router.delete('/deleteMe', deleteMe); // Delete user


router.use(authController.restrictTo('admin'));
 // USERS ROUTE
 router.route('/').get(getAllUsers).post(createUser);
 router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
 module.exports = router;