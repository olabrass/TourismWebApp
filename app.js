const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const app = express();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');


const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController');

app.use(helmet()); // Middleware to set HTTP headers for security

if (process.env.NODE_ENV === 'development') {
    // This is a middleware that logs all requests to the console in development mode
    app.use(morgan('dev'));
}

// Rate limiting middleware to limit the number of requests from a single IP address
const limiter = rateLimit({ 
    max: 100, // Maximum number of requests allowed from a single IP address
    windowMs: 60 * 60 * 1000, // Time window in milliseconds
    message: 'Too many requests from this IP, please try again in an hour!' // Message to send when the limit is exceeded
});

// Apply the rate limiting middleware to all requests
app.use('/api', limiter);

// midleware for accepting data, body parser
//app.use(express.json());
app.use(express.json({limit:'10kb'})); // Middleware to parse JSON data in request body with a limit of 10kb
app.use(mongoSanitize()); // Middleware to sanitize user input against NoSQL query injection
app.use(xss()); // Middleware to sanitize user input against XSS attacks
app.use(hpp({
    // Whitelist of query parameters to allow duplicates for 
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price'] 
})); // Middleware to prevent parameter pollution by removing duplicate query parameters


 //Data sanitization against NoSQL query


 //Data sanitization against XSS

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


    // This was used to create a custom error class that can be used to handle errors in the application
    // const err = new Error(`Can't find ${req.originalUrl} on this server `);
    // err.status = 'fail';
    // err.statusCode = '404';

    // After refactoring the code to use a custom error class, we can now create an instance of the AppError class and pass it to the next function
    const err = new AppError(`Can't find ${req.originalUrl} on this server `, 404);
    next(err);
})

// Global Error handling middleware
// The idea is to create a middleware and create the error it will handle, so the middleware is created below and the error is created above
// Global error handling middleware
app.use(globalErrorHandler);

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



