const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const  catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { sendEmail } = require('./../utils/email');

// Function to sign a JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

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
const token = signToken(newUser._id);

  // Generate a JWT token for the new user
  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN

  
  // Send response
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
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
    res.status(200).json({
      status: 'success',
      token
    });
 
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

});

const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;