const express = require('express');

  // router middleware
  const router = express.Router();

 //  USER ROUTE HANDLER
 const getAllUsers = (req, res) => {
    res.status(500).json({
        status: "Error",
        message: "Route Not Yet Created"
    })
 };

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