const express = require('express');
const {
  register,
  login,
  resetPassword,
  refreshToken,
  logout
} = require('../controllers/authControllers');
const {
  requestPasswordReset,
  resetPassword: resetPasswordWithToken,
  verifyResetToken
} = require('../controllers/passwordResetController');
const {
  validate,
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  requestPasswordResetSchema,
  resetPasswordWithTokenSchema
} = require('../middleware/validation');
const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword); // Legacy direct reset
router.post(
  '/request-password-reset',
  validate(requestPasswordResetSchema),
  requestPasswordReset
);
router.post(
  '/reset-password-with-token',
  validate(resetPasswordWithTokenSchema),
  resetPasswordWithToken
);
router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;
