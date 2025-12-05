import express from 'express';
import { PrismaClient } from '@prisma/client';
import { TwitterService } from '../services/TwitterService.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
const prisma = new PrismaClient();
// Get connected accounts
router.get('/accounts', authenticate, async (req, res) => {
    try {
        const accounts = await prisma.socialAccount.findMany({
            where: { userId: req.user.userId },
            select: {
                id: true,
                platform: true,
                username: true,
                isActive: true,
                tokenExpiry: true,
                createdAt: true,
            },
        });
        res.json(accounts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Connect Twitter (simplified - in production, use full OAuth flow)
router.post('/connect/twitter', authenticate, async (req, res) => {
    try {
        const { accessToken, accessSecret, twitterUserId, username } = req.body;
        if (!accessToken || !accessSecret || !twitterUserId || !username) {
            return res.status(400).json({
                error: 'Missing required fields: accessToken, accessSecret, twitterUserId, username',
            });
        }
        const account = await TwitterService.connectAccount(req.user.userId, {
            accessToken,
            accessSecret,
            twitterUserId,
            username,
        });
        res.json({ message: 'Twitter account connected', account });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Disconnect account
router.delete('/account/:id', authenticate, async (req, res) => {
    try {
        const account = await prisma.socialAccount.findUnique({
            where: { id: req.params.id },
        });
        if (!account || account.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Account not found' });
        }
        await prisma.socialAccount.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Account disconnected' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Toggle account active status
router.patch('/account/:id/toggle', authenticate, async (req, res) => {
    try {
        const account = await prisma.socialAccount.findUnique({
            where: { id: req.params.id },
        });
        if (!account || account.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Account not found' });
        }
        const updated = await prisma.socialAccount.update({
            where: { id: req.params.id },
            data: { isActive: !account.isActive },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
export default router;
