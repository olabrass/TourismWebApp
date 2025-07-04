const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const  catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail  = require('./../utils/email');
const crypto = require('crypto');

// Function to sign a JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

// Function to create and send a JWT token in the response
// This function is used in both signup and login methods to send the token back to the client
const createSendToken = (user, statusCode, res) => {
  // Generate a JWT token
  const token = signToken(user._id);

  const cookieOptions = {
    // Set the cookie to expire in the number of days specified in the environment variable
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000 // Convert days to milliseconds
    ),
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === 'production', // Set to true in production to use HTTPS
    sameSite: 'strict', // Helps prevent CSRF attacks
  }
  res.cookie('jwt', token, cookieOptions);

  // Remove the password from the user object before sending it in the response
  user.password = undefined; // Ensure password is not sent in the response

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user, 
    },
  });
};


// Middleware to handle user signup
exports.signup = catchAsync(async (req, res, next) => {
  // Create a new user instance
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role || 'user', // Default role is 'user'
  });

  // Generate a JWT token for the new user
  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN

  
  // Send response
  createSendToken(newUser, 201, res);
});

// Middleware to handle user login
exports.login = catchAsync(async(req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
   return next(new AppError('Please provide email and password', 400));
    
  }
  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  //the correctPassword method is an instance method defined in the userModel
  // Check if user exists and password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

       let token = signToken(user._id);
  //   // Generate a JWT token
  //   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRES_IN,
  //   });

    // Send response
    createSendToken (user, 200, res);
 
});

// Middleware to protect routes
exports.protect = catchAsync(async(req, res, next)=>{
let token;
  // Check if token is provided in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // If no token is provided, return an error
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
  // Find the user by ID from the decoded token
  const currentUser = await User.findById(decoded.id);
  
  // If user does not exist, return an error
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  // Attach user to request object
  req.user = currentUser;
  
  //Grant access to the protected route
  next();
});

// Middleware to restrict access to certain roles
exports.restrictTo = (...roles) => {
  // roles is an array of allowed roles, e.g., ['admin', 'lead-guide']
  return (req, res, next)=>{
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  }
};

// Middleware to handle forgot password
exports.forgotPassword =catchAsync(async (req, res, next) => {
  //get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }
  // Generate a reset token
  // The createPasswordResetToken method is an instance method defined in the userModel
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

//create rest link with a token
const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

try{

  await sendEmail({
    email: user.email,
    subject: 'Your password reset token (valid for 10 min)',
    message,
    });
    
    res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }    
});
exports.resetPassword =catchAsync(async (req, res, next) => {
  //Get user based on the token
 const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
 const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Check if token is not expired
  });

  //If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;  // Clear the reset token
  user.passwordResetExpires = undefined;
  await user.save(); // Save the updated user

  // Update changedPasswordAt property for the user

  // Log the user in, send JWT
  createSendToken (user, 200, res);
});

//Update password for a logged in user
exports.updatePassword = catchAsync(async(req, res, next) =>{
  // 1. Get the user from the database
  const user = await User.findById(req.user.id).select('+password');
  // 2. Check if the current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  // 3. If so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // Save the updated user
  //user.findByIdAndUpdate will not work as intended here because it does not trigger the pre-save middleware for password hashing
  // 4. Log the user in, send JWT
  createSendToken (user, 200, res);
})
