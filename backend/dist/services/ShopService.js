import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class ShopService {
    // Créer un produit
    static async createProduct(userId, data) {
        return await prisma.product.create({
            data: {
                userId,
                title: data.title,
                description: data.description,
                price: data.price,
                currency: data.currency || 'USD',
                image: data.image,
                stock: data.stock || 0,
            },
        });
    }
    // Obtenir les produits d'un utilisateur
    static async getUserProducts(userId, activeOnly = false) {
        return await prisma.product.findMany({
            where: {
                userId,
                ...(activeOnly && { isActive: true }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    // Obtenir tous les produits actifs (pour le shop public)
    static async getActiveProducts() {
        return await prisma.product.findMany({
            where: { isActive: true, stock: { gt: 0 } },
            include: {
                user: {
                    select: {
                        username: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    // Mettre à jour un produit
    static async updateProduct(productId, userId, data) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product || product.userId !== userId) {
            throw new Error('Unauthorized or product not found');
        }
        return await prisma.product.update({
            where: { id: productId },
            data,
        });
    }
    // Supprimer un produit
    static async deleteProduct(productId, userId) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product || product.userId !== userId) {
            throw new Error('Unauthorized or product not found');
        }
        await prisma.product.delete({
            where: { id: productId },
        });
    }
    // Enregistrer une donation
    static async createDonation(data) {
        return await prisma.donation.create({
            data: {
                userId: data.userId,
                donorName: data.donorName,
                donorEmail: data.donorEmail,
                amount: data.amount,
                currency: data.currency || 'USD',
                message: data.message,
                stripeId: data.stripeId,
                status: 'COMPLETED',
            },
        });
    }
    // Obtenir les donations reçues
    static async getUserDonations(userId) {
        return await prisma.donation.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    // Stats des donations
    static async getDonationStats(userId) {
        const donations = await prisma.donation.findMany({
            where: { userId, status: 'COMPLETED' },
        });
        const total = donations.reduce((sum, d) => sum + d.amount, 0);
        const count = donations.length;
        return {
            total,
            count,
            average: count > 0 ? Math.round(total / count) : 0,
        };
    }
}
