const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// midleware for accepting data
app.use(express.json());

// Middleware for serving a static file
app.use(express.static(`${__dirname}/public`));

// custom middleware
app.use((req, res, next) => {
    req.requesTime = new Date().toISOString();
    next();
}
)

// USING THE MOUNTED ROUTER AS A MIDDLEWARE
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// HANDLING UNHANDLED ROUTE === If a request should get to this line of code, it simply means that the routes above did not the the route requested by the user, so we need to handle all other route not defined in the program

app.all('*', (req, res, next)=>{
    // res.status(404).json({
    //     status: 'Failed',
    //     message: `Can't find ${req.originalUrl} on this server `
    // })

    const err = new Error(`Can't find ${req.originalUrl} on this server `);
    err.status = 'fail';
    err.statusCode = '404';
    next(err);
})

// Global Error handling middleware
// The idea is to create a middleware and create the error it will handle, so the middleware is created below and the error is created above
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'error';
    
    res.status(err.statusCode).json({
        status : err.status,
        message : err.message
    });
});

module.exports = app;
// ROUTING
// app.get('/', (req, res)=>{
//     res.status(200).json({Name : "My App", Message: "Welcome to my app"});
// })

  
// app.get('/api/v1/tours', getAllTour);
// Getting request through post method and save to file
// app.post(`/api/v1/tours`, postTour)
// Getting data by ID
// app.get('/api/v1/tours/:id', getTourById)



