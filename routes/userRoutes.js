 const express = require('express');
//  Check tourRoutes for another method of doing this
 const {getAllUsers, createUser, getUser, updateUser, deleteUser} = require('../controllers/userController');
 
// MOUNTING ROUTER
const router = express.Router();

 // USERS ROUTE
 router.route('/').get(getAllUsers).post(createUser);
 router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
 module.exports = router;