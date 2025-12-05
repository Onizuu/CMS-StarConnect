import express from 'express';
import { ContentService } from '../services/ContentService.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
const router = express.Router();
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const content = await ContentService.createContent({ userId: req.user!.userId, ...req.body });
    res.status(201).json(content);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.query.my === 'true' && req.user ? req.user.userId : undefined;
    const content = await ContentService.listContent(userId);
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const content = await ContentService.updateContent(req.params.id, req.user!.userId, req.body);
    res.json(content);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await ContentService.deleteContent(req.params.id, req.user!.userId);
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
export default router;
