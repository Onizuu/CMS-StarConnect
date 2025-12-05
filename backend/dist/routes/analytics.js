import express from 'express';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { VisitorHasher } from '../services/VisitorHasher.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// Track page view (public - no auth required)
router.post('/track', async (req, res) => {
    try {
        const { page, contentId, userId, referrer, duration } = req.body;
        // Générer visitor ID anonyme
        const visitorId = VisitorHasher.getVisitorIdFromRequest(req);
        const userAgent = VisitorHasher.extractUserAgent(req);
        await AnalyticsService.trackPageView({
            page,
            contentId,
            userId,
            visitorId,
            referrer,
            userAgent,
            duration,
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get dashboard stats (authenticated)
router.get('/dashboard', authenticate, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const stats = await AnalyticsService.getUserStats(req.user.userId, days);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get content stats (authenticated)
router.get('/content/:contentId', authenticate, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const stats = await AnalyticsService.getContentStats(req.params.contentId, days);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Generate report (authenticated)
router.get('/report', authenticate, async (req, res) => {
    try {
        const period = req.query.period || '30d';
        const report = await AnalyticsService.generateReport(req.user.userId, period);
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Export CSV (authenticated)
router.get('/export/csv', authenticate, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const csv = await AnalyticsService.exportToCSV(req.user.userId, days);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="analytics.csv"');
        res.send(csv);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
