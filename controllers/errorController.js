// //Global Error handler 
// module.exports = (err, req, res, next) => {
//     err.statusCode = err.statusCode || 500;
//     err.message = err.message || 'error';
    
//     res.status(err.statusCode).json({
//         status : err.status,
//         message : err.message
//     });
// }

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || (err.statusCode.toString().startsWith('4') ? 'fail' : 'error');
    err.message = err.message || 'An unexpected error occurred';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
};
