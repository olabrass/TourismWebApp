const express = require('express');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async(req, res) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: "All Tours",
        tours: tours
    });
});

exports.getTour= catchAsync(async(req, res) => {
    //"findOne" is used instead of findById, because the id is not known, we are querying using slug
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'review',
        fields: 'review rating user'
    });
    if (!tour) {
        return res.status(404).render('error', {
            message: 'Tour not found'
        });

    }   
    res.status(200).render('tour', {
        title: "Tour",
        tour: tour
    });
});
