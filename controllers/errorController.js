const AppError = require('./../utils/appError');

// Handling Invalid Id error
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

// Handling Duplicate field error
const handleDuplicateFieldsDB = err => {
    const value = err.keyValue.name;
    const message = `Duplicate field value: "${value}". Please use another value!`;
    return new AppError(message, 400);
}

// Dev error sender
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack
    });
};

// Production error sender
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = err;  // ✅ no cloning, keep all properties

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);

        sendErrorProd(error, res);
    }
    //  else {
    //     res.status(500).json({
    //         status: 'error',
    //         message: 'Something went very wrong!'
    //     });
    // }
};
