import express from 'express';
import { SocialAggregatorService } from '../services/SocialAggregatorService.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// Get unified feed for a user (public)
router.get('/:username', async (req, res) => {
    try {
        const feed = await SocialAggregatorService.getUnifiedFeed(req.params.username);
        res.json(feed);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Sync social posts (authenticated)
router.post('/sync', authenticate, async (req, res) => {
    try {
        const results = await SocialAggregatorService.syncUserPosts(req.user.userId);
        res.json({ message: 'Sync complete', results });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get engagement stats (authenticated)
router.get('/stats/engagement', authenticate, async (req, res) => {
    try {
        const stats = await SocialAggregatorService.getEngagementStats(req.user.userId);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
