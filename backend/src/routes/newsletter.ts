import express from 'express';
import { NewsletterService } from '../services/NewsletterService.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Public: S'abonner à la newsletter
router.post('/subscribe', async (req, res) => {
    try {
        const { userId, email, name } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const subscriber = await NewsletterService.subscribe({
            userId,
            email,
            name,
        });

        res.json({ message: 'Successfully subscribed to newsletter!', subscriber });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Public: Se désabonner
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email, userId } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        await NewsletterService.unsubscribe(email, userId);
        res.json({ message: 'Successfully unsubscribed from newsletter' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Auth: Obtenir mes abonnés
router.get('/subscribers', authenticate, async (req: AuthRequest, res) => {
    try {
        const subscribers = await NewsletterService.getSubscribers(req.user!.userId);
        res.json(subscribers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Auth: Stats des abonnés
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
    try {
        const stats = await NewsletterService.getStats(req.user!.userId);
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Auth: Envoyer une newsletter
router.post('/send', authenticate, async (req: AuthRequest, res) => {
    try {
        const { subject, content } = req.body;

        if (!subject || !content) {
            return res.status(400).json({
                error: 'Missing required fields: subject, content',
            });
        }

        const result = await NewsletterService.sendNewsletter(req.user!.userId, {
            subject,
            content,
        });

        res.json({ message: 'Newsletter sent successfully!', result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
