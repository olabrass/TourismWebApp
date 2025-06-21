const User = require('./../models/userModel');
const  catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  // Create a new user instance
  const newUser = await User.create(req.body);

  // Send response
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});