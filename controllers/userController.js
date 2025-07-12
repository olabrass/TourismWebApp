const express = require('express');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

  // router middleware
  const router = express.Router();

// This function filters the object properties based on the allowed fields
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

  // Update current user password(User updates by himself)
const updateMe = catchAsync(async (req, res, next)=>{
    if(req.body.password||req.body.passwordConfirm){
        return next(new AppError("This route is not for password updates. Please use /updateMyPassword", 400)
    );
    }

    // Filter out unwanted fields from the request body
    const filteredBody = filterObj(req.body, 'name', 'email');
    // Update user with filtered body request
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, 
        runValidators: true
    });

res.status(200).json({
    status: "Success",
    message: "User data updated successfully",
    data: {
        user: updatedUser
    }
})
});


// Delete current user (User deletes himself)
const deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active:false});
    res.status(204).json({
        status: "Success",
        data:null
    });
});

// Get current user (User gets his own data)
const getMe = (req, res, next) => {
    // This middleware sets the user id to req.params.id
    req.params.id = req.user.id;
    next();
};


 //  USER ROUTE HANDLER
 const createUser = (req, res) => {
     res.status(500).json({
        status: "Error",
        message: "Route Not Yet Created, please use /signup instead",
    })
 };


 const getAllUsers = factory.getAll(User);
 const getUser = factory.getOne(User);
 //Do not update password with this
 const updateUser = factory.updateOne(User);
 const deleteUser = factory.deleteOne(User);

 module.exports = {getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe};