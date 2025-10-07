const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');

class TokenService {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET;
    this.refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRES_IN || '1d';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  // Generate access token (short-lived)
  generateAccessToken(userId) {
    return jwt.sign(
      {
        id: userId,
        type: 'access'
      },
      this.accessTokenSecret,
      { expiresIn: this.accessTokenExpiry }
    );
  }

  // Generate refresh token (long-lived)
  generateRefreshToken(userId) {
    const tokenId = randomBytes(16).toString('hex');
    return jwt.sign(
      {
        id: userId,
        type: 'refresh',
        tokenId
      },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry }
    );
  }

  // Generate both tokens
  generateTokenPair(userId) {
    return {
      accessToken: this.generateAccessToken(userId),
      refreshToken: this.generateRefreshToken(userId)
    };
  }

  // Verify access token
  verifyAccessToken(token) {
    const decoded = jwt.verify(token, this.accessTokenSecret);
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    const decoded = jwt.verify(token, this.refreshTokenSecret);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  }

  // Extract token from Authorization header
  extractTokenFromHeader(authHeader) {
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

module.exports = new TokenService();
