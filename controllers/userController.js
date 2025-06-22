const express = require('express');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

  // router middleware
  const router = express.Router();

 //  USER ROUTE HANDLER
 const getAllUsers = catchAsync(async(req, res, next) => {
    // Fetch all users from the database
    const users = await User.find();
    res.status(200).json({
        status: "Success",
        results: users.length,
        message: {
            users: users
        }
    })
 });

 const createUser = (req, res) => {
    res.status(500).json({
        status: "Error",
        message: "Route Not Yet Created"
    })
 };

 const getUser = (req, res) => {
    res.status(500).json({
        status: "Error",
        message: "Route Not Yet Created"
    })
 };

 const updateUser = (req, res) => {
    res.status(500).json({
        status: "Error",
        message: "Route Not Yet Created"
    })
 };

 const deleteUser = (req, res) => {
    res.status(500).json({
        status: "Error",
        message: "Route Not Yet Created"
    })
 };

 module.exports = {getAllUsers, createUser, getUser, updateUser, deleteUser};