class AppError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
        // this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// This is a custom error class that extends the built-in Error class. It takes a message and a status code as parameters and sets the status based on the status code. It also sets an isOperational property to true, which can be used to distinguish between operational errors and programming errors. The captureStackTrace method is called to capture the stack trace of the error.
module.exports = AppError;

