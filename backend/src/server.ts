import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import mediaRoutes from './routes/media.js';
import profileRoutes from './routes/profile.js';
import crisisRoutes from './routes/crisis.js';
import socialRoutes from './routes/social.js';
import publishRoutes from './routes/publish.js';
import feedRoutes from './routes/feed.js';
import analyticsRoutes from './routes/analytics.js';
import commentsRoutes from './routes/comments.js';
import shopRoutes from './routes/shop.js';
import newsletterRoutes from './routes/newsletter.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Servir les fichiers uploadés statiquement
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'StarConnect CMS API', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/crisis', crisisRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/publish', publishRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend: http://localhost:${PORT}`);
});
