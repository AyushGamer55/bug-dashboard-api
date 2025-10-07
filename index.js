const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { logger } = require('./utils/logger');
require('dotenv').config();

const bugRoutes = require('./routes/bugRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.set('trust proxy', 1);

// ✅ Security & Core Middleware (minimal, non-breaking)
const allowlist = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
app.use(
  cors(allowlist.length ? { origin: allowlist, credentials: true } : undefined)
);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));



// Basic rate limiting for API routes (conservative defaults)
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', apiLimiter);

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Routes
app.use('/api/bugs', bugRoutes);
app.use('/api/auth', authRoutes);

// ✅ Route to fetch images from Cloudinary (protected)
app.get('/api/images', authMiddleware, async (req, res) => {
  try {
    const folder = process.env.CLOUDINARY_FOLDER || 'Screenshots';
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    const images = result.resources.map(img => ({
      url: img.secure_url,
      public_id: img.public_id,
      created_at: img.created_at
    }));

    res.json(images);
  } catch (error) {
    logger.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images from Cloudinary' });
  }
});

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('🚀 Bug Dashboard Backend is Running!');
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => logger.error('❌ MongoDB connection failed:', err));

// ✅ Centralized error handler (last middleware)
// Keeps response shape consistent without changing controller logic
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  const message = err.message || 'Server error';
  res.status(status).json({ message });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
