require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const passageRoutes = require('./routes/passages');
const attemptRoutes = require('./routes/attempts');
const adminRoutes = require('./routes/admin');
const studyItemRoutes = require('./routes/studyItems');
const newsRoutes = require('./routes/news');
const writingRoutes = require('./routes/writing');

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Uploaded passage files (html/txt bodies, attachments, audio) are served
// straight from disk. In production, point this at a real object store
// (S3/Cloudinary) instead - see backend/middleware/upload.js.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/passages', passageRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/study-items', studyItemRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/writing', writingRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
