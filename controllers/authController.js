const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const  catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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
    passwordConfirm: req.body.passwordConfirm
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
 
})