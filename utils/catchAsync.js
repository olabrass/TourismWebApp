//The blocks of code below is used instead of try catch to handle errors in asynchronous functions. The first block is a custom error handler that catches errors and passes them to the next middleware, while the second block is a function that wraps the original function to catch errors and pass them to the next middleware.
// const AppError = require('./../utils/appError');
const catchAsync = fn => {
  return (req, res, next) => {
    // This is a function that takes another function as an argument and returns a new function that handles errors
    fn(req, res, next).catch(next);
  };  
};  


module.exports = catchAsync;