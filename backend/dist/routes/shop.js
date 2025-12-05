import express from 'express';
import { ShopService } from '../services/ShopService.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// Public: Obtenir tous les produits actifs
router.get('/products', async (req, res) => {
    try {
        const products = await ShopService.getActiveProducts();
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Auth: Obtenir mes produits
router.get('/my-products', authenticate, async (req, res) => {
    try {
        const products = await ShopService.getUserProducts(req.user.userId);
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Auth: Créer un produit
router.post('/product', authenticate, async (req, res) => {
    try {
        const { title, description, price, currency, image, stock } = req.body;
        if (!title || !description || price === undefined) {
            return res.status(400).json({
                error: 'Missing required fields: title, description, price',
            });
        }
        const product = await ShopService.createProduct(req.user.userId, {
            title,
            description,
            price: Math.round(price * 100), // Convertir en centimes
            currency,
            image,
            stock,
        });
        res.json({ message: 'Product created', product });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Auth: Mettre à jour un produit
router.put('/product/:id', authenticate, async (req, res) => {
    try {
        const product = await ShopService.updateProduct(req.params.id, req.user.userId, req.body);
        res.json({ message: 'Product updated', product });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Auth: Supprimer un produit
router.delete('/product/:id', authenticate, async (req, res) => {
    try {
        await ShopService.deleteProduct(req.params.id, req.user.userId);
        res.json({ message: 'Product deleted' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Public: Enregistrer une donation
router.post('/donate', async (req, res) => {
    try {
        const { userId, donorName, donorEmail, amount, currency, message } = req.body;
        if (!userId || !amount) {
            return res.status(400).json({
                error: 'Missing required fields: userId, amount',
            });
        }
        const donation = await ShopService.createDonation({
            userId,
            donorName,
            donorEmail,
            amount: Math.round(amount * 100), // Convertir en centimes
            currency,
            message,
        });
        res.json({ message: 'Donation received! Thank you!', donation });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Auth: Obtenir mes donations
router.get('/donations', authenticate, async (req, res) => {
    try {
        const donations = await ShopService.getUserDonations(req.user.userId);
        res.json(donations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Auth: Stats des donations
router.get('/donations/stats', authenticate, async (req, res) => {
    try {
        const stats = await ShopService.getDonationStats(req.user.userId);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
