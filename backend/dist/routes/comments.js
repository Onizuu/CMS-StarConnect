import express from 'express';
import { CommentService } from '../services/CommentService.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// Public: Créer un commentaire (pas d'auth requise)
router.post('/', async (req, res) => {
    try {
        const { contentId, author, email, text, parentId } = req.body;
        if (!contentId || !author || !text) {
            return res.status(400).json({
                error: 'Missing required fields: contentId, author, text',
            });
        }
        const comment = await CommentService.createComment({
            contentId,
            author,
            email,
            text,
            parentId,
        });
        res.json({ message: 'Comment submitted for moderation', comment });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Public: Obtenir commentaires d'un contenu (approuvés uniquement)
router.get('/content/:contentId', async (req, res) => {
    try {
        const comments = await CommentService.getContentComments(req.params.contentId, false);
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Auth: Obtenir tous mes commentaires (pour modération)
router.get('/my', authenticate, async (req, res) => {
    try {
        const status = req.query.status;
        const comments = await CommentService.getAllComments(req.user.userId, status);
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Auth: Stats de mes commentaires
router.get('/stats', authenticate, async (req, res) => {
    try {
        const stats = await CommentService.getCommentStats(req.user.userId);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Auth: Approuver un commentaire
router.post('/:id/approve', authenticate, async (req, res) => {
    try {
        const comment = await CommentService.approveComment(req.params.id, req.user.userId);
        res.json({ message: 'Comment approved', comment });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Auth: Rejeter un commentaire
router.post('/:id/reject', authenticate, async (req, res) => {
    try {
        const comment = await CommentService.rejectComment(req.params.id, req.user.userId);
        res.json({ message: 'Comment rejected', comment });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Auth: Marquer comme spam
router.post('/:id/spam', authenticate, async (req, res) => {
    try {
        const comment = await CommentService.markAsSpam(req.params.id, req.user.userId);
        res.json({ message: 'Comment marked as spam', comment });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Auth: Supprimer un commentaire
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await CommentService.deleteComment(req.params.id, req.user.userId);
        res.json({ message: 'Comment deleted' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
export default router;
