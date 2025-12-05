import express from 'express';
import { SocialPublishService } from '../services/SocialPublishService.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// Publish content to social platforms
router.post('/now', authenticate, async (req, res) => {
    try {
        const { contentId, platforms } = req.body;
        if (!contentId || !platforms || !Array.isArray(platforms)) {
            return res.status(400).json({
                error: 'Missing contentId or platforms array',
            });
        }
        const result = await SocialPublishService.publishToSocial(req.user.userId, contentId, platforms);
        res.json({ message: 'Publishing initiated', result });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Schedule publish
router.post('/schedule', authenticate, async (req, res) => {
    try {
        const { contentId, platforms, scheduledFor } = req.body;
        if (!contentId || !platforms || !scheduledFor) {
            return res.status(400).json({
                error: 'Missing required fields',
            });
        }
        const result = await SocialPublishService.publishToSocial(req.user.userId, contentId, platforms, new Date(scheduledFor));
        res.json({ message: 'Publish scheduled', result });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get publish queue
router.get('/queue', authenticate, async (req, res) => {
    try {
        const queue = await SocialPublishService.getQueue(req.user.userId);
        res.json(queue);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Cancel queued publish
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await SocialPublishService.cancelQueueItem(req.params.id, req.user.userId);
        res.json({ message: 'Publish cancelled' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
export default router;
