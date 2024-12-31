import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fetchAndCacheVideos } from './services/youtube.js';
import { videoRouter } from './routes/videos.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:5173',
    'https://youtube-shorts-player.onrender.com',
    'https://youtube-shorts-api-3aqw.onrender.com',
    '*'  // Temporarily allow all origins for testing
  ],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
    });
    console.log('Connected to MongoDB');
    // Initial fetch of videos
    await fetchAndCacheVideos();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/videos', videoRouter);

// Fetch videos every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Fetching new videos...');
  await fetchAndCacheVideos();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 