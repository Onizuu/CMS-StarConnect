import express from 'express';
import { ProfileService } from '../services/ProfileService.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// Get public profile by username
router.get('/:username', async (req, res) => {
    try {
        const profile = await ProfileService.getUserProfile(req.params.username);
        if (!profile) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!profile.isPublic) {
            return res.status(403).json({ error: 'Profile is private' });
        }
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get public content for a user
router.get('/:username/content', async (req, res) => {
    try {
        const content = await ProfileService.getPublicContent(req.params.username);
        res.json(content);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update own profile (authenticated)
router.put('/me', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const profile = await ProfileService.updateProfile(userId, req.body);
        res.json(profile);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get own profile (authenticated)
router.get('/me/profile', authenticate, async (req, res) => {
    try {
        const user = await ProfileService.getUserProfile(req.user.username);
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
