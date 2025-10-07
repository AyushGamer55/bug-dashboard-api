const User = require('../models/User');
const bcrypt = require('bcryptjs');
const tokenService = require('../services/tokenService');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'auth-controller' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// 🔹 Register new user
exports.register = async (req, res) => {
  try {
    const { name = '', email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    const { accessToken, refreshToken } = tokenService.generateTokenPair(
      user._id
    );

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    await user.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    logger.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 Login existing user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = tokenService.generateTokenPair(
      user._id
    );

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 Direct password reset (no email)
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    logger.error('Direct reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 Refresh access token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = tokenService.verifyRefreshToken(refreshToken);

    // Find user and check if refresh token exists and is valid
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokenRecord = user.refreshTokens.find(t => t.token === refreshToken);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ message: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = tokenService.generateAccessToken(user._id);

    res.json({
      accessToken,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    logger.error('Refresh token error:', err);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// 🔹 Logout (invalidate refresh token)
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    // Find user and remove refresh token
    const user = await User.findOne({ 'refreshTokens.token': refreshToken });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(
        t => t.token !== refreshToken
      );
      await user.save();
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    logger.error('Logout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
