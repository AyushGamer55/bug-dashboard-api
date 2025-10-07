const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');
const { passwordResetTemplate } = require('../utils/emailTemplates');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your preferred email service
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Consider using app passwords for Gmail
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send password reset email
const sendResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - Bug Dashboard',
    html: passwordResetTemplate(resetUrl, email)
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
};

// Request password reset (send email)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        message:
          'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token and expiry
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send email
    const emailSent = await sendResetEmail(email, resetToken);

    if (!emailSent) {
      return res.status(500).json({
        message: 'Failed to send reset email. Please try again later.'
      });
    }

    res.json({
      message:
        'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (err) {
    logger.error('Request password reset error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    logger.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify reset token (for frontend validation)
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset token'
      });
    }

    res.json({ message: 'Token is valid' });
  } catch (err) {
    logger.error('Verify reset token error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
