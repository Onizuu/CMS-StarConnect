import express from 'express';
import { CommentService } from '../services/CommentService.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

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
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Public: Obtenir commentaires d'un contenu (approuvés uniquement)
router.get('/content/:contentId', async (req, res) => {
    try {
        const comments = await CommentService.getContentComments(req.params.contentId, false);
        res.json(comments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Auth: Obtenir tous mes commentaires (pour modération)
router.get('/my', authenticate, async (req: AuthRequest, res) => {
    try {
        const status = req.query.status as string | undefined;
        const comments = await CommentService.getAllComments(req.user!.userId, status);
        res.json(comments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Auth: Stats de mes commentaires
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
    try {
        const stats = await CommentService.getCommentStats(req.user!.userId);
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Auth: Approuver un commentaire
router.post('/:id/approve', authenticate, async (req: AuthRequest, res) => {
    try {
        const comment = await CommentService.approveComment(req.params.id, req.user!.userId);
        res.json({ message: 'Comment approved', comment });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Auth: Rejeter un commentaire
router.post('/:id/reject', authenticate, async (req: AuthRequest, res) => {
    try {
        const comment = await CommentService.rejectComment(req.params.id, req.user!.userId);
        res.json({ message: 'Comment rejected', comment });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Auth: Marquer comme spam
router.post('/:id/spam', authenticate, async (req: AuthRequest, res) => {
    try {
        const comment = await CommentService.markAsSpam(req.params.id, req.user!.userId);
        res.json({ message: 'Comment marked as spam', comment });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Auth: Supprimer un commentaire
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        await CommentService.deleteComment(req.params.id, req.user!.userId);
        res.json({ message: 'Comment deleted' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
