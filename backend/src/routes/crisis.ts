import express from 'express';
import { CrisisService } from '../services/CrisisService.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get crisis mode status (public - for checking if user has crisis active)
router.get('/status/:username', async (req, res) => {
    try {
        const status = await CrisisService.checkCrisisStatus(req.params.username);
        res.json(status || { isActive: false });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get own crisis mode configuration (authenticated)
router.get('/me', authenticate, async (req: AuthRequest, res) => {
    try {
        const crisisMode = await CrisisService.getCrisisMode(req.user!.userId);
        res.json(crisisMode);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update crisis template (authenticated)
router.put('/template', authenticate, async (req: AuthRequest, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({ error: 'Title and message are required' });
        }

        const crisisMode = await CrisisService.updateCrisisTemplate(
            req.user!.userId,
            { title, message }
        );

        res.json(crisisMode);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Activate crisis mode (authenticated)
router.post('/activate', authenticate, async (req: AuthRequest, res) => {
    try {
        const crisisMode = await CrisisService.activateCrisis(req.user!.userId);
        res.json({ message: 'Crisis mode activated', crisisMode });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Deactivate crisis mode (authenticated)
router.post('/deactivate', authenticate, async (req: AuthRequest, res) => {
    try {
        const crisisMode = await CrisisService.deactivateCrisis(req.user!.userId);
        res.json({ message: 'Crisis mode deactivated', crisisMode });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
