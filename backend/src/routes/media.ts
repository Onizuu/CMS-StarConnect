import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { MediaService } from '../services/MediaService.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.'));
        }
    }
});

// Upload de média
router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user!.userId;
        const file = req.file;

        // Générer une thumbnail si c'est une image
        let thumbnailPath: string | undefined;
        if (file.mimetype.startsWith('image/')) {
            const thumbFilename = 'thumb_' + file.filename;
            thumbnailPath = path.join(uploadsDir, thumbFilename);

            await sharp(file.path)
                .resize(300, 300, { fit: 'inside' })
                .toFile(thumbnailPath);
        }

        // Sauvegarder dans la base de données
        const media = await MediaService.createMedia({
            userId,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
            thumbnail: thumbnailPath ? `/uploads/thumb_${file.filename}` : undefined,
        });

        res.status(201).json(media);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Liste des médias
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.query.my === 'true' ? req.user!.userId : undefined;
        const media = await MediaService.listMedia(userId);
        res.json(media);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Détails d'un média
router.get('/:id', async (req, res) => {
    try {
        const media = await MediaService.getMediaById(req.params.id);
        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }
        res.json(media);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Suppression d'un média
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const media = await MediaService.getMediaById(req.params.id);

        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }

        await MediaService.deleteMedia(req.params.id, req.user!.userId);

        // Supprimer les fichiers physiques
        const filePath = path.join(uploadsDir, media.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        if (media.thumbnail) {
            const thumbPath = path.join(uploadsDir, path.basename(media.thumbnail));
            if (fs.existsSync(thumbPath)) {
                fs.unlinkSync(thumbPath);
            }
        }

        res.json({ message: 'Media deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
