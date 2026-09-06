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

// Configure CORS for production and local development
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*';
app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));

app.use(express.json());

// Uploaded passage files (html/txt bodies, attachments, audio) are served
// straight from disk. Note: Dynamic user uploads on Render's free tier wipe 
// on restart unless using persistent disks or S3/Cloudinary.
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

// Explicitly bind to '0.0.0.0' for Render deployment
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));