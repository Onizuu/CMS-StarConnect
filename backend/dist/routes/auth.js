import express from 'express';
import { AuthService } from '../services/AuthService.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, username, password, name } = req.body;
        // Validation simple
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await AuthService.register({
            email,
            username,
            password,
            name,
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing credentials' });
        }
        const result = await AuthService.login(email, password);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
// Refresh token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }
        const result = await AuthService.refreshAccessToken(refreshToken);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
// Logout
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }
        await AuthService.logout(refreshToken);
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get current user (protected)
router.get('/me', authenticate, async (req, res) => {
    try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                role: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
