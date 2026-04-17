const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const User = require('../models/User');

// Helper: Generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// Helper: Generate a unique random username
const generateUsername = () => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: '_',
    style: 'lowerCase',
    length: 3,
  });
};

// @desc    Register a new user (auto-generates random username)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Generate a unique username with collision retry logic
  let username;
  let userExists = true;
  let attempts = 0;
  while (userExists && attempts < 10) {
    username = generateUsername();
    userExists = await User.findOne({ username });
    attempts++;
  }

  if (userExists) {
    res.status(500);
    throw new Error('Could not generate a unique username. Please try again.');
  }

  const user = await User.create({ username, password });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      token: generateToken(user._id),
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('Username and password are required');
  }

  // Explicitly select password since it's excluded by default
  const user = await User.findOne({ username }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid username or password');
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      token: generateToken(user._id),
    },
  });
});

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      createdAt: user.createdAt,
    },
  });
});

module.exports = { registerUser, loginUser, getMe };
