import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NewsletterService {
    // S'abonner à la newsletter
    static async subscribe(data: {
        userId?: string;
        email: string;
        name?: string;
    }) {
        // Vérifier si déjà abonné
        const existing = await prisma.newsletterSubscriber.findFirst({
            where: {
                userId: data.userId,
                email: data.email,
            },
        });

        if (existing) {
            if (!existing.isActive) {
                // Réactiver l'abonnement
                return await prisma.newsletterSubscriber.update({
                    where: { id: existing.id },
                    data: { isActive: true },
                });
            }
            return existing;
        }

        return await prisma.newsletterSubscriber.create({
            data: {
                userId: data.userId,
                email: data.email,
                name: data.name,
            },
        });
    }

    // Se désabonner
    static async unsubscribe(email: string, userId?: string) {
        const subscriber = await prisma.newsletterSubscriber.findFirst({
            where: {
                email,
                ...(userId && { userId }),
            },
        });

        if (!subscriber) {
            throw new Error('Subscriber not found');
        }

        return await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: { isActive: false },
        });
    }

    // Obtenir tous les abonnés actifs d'un créateur
    static async getSubscribers(userId: string, activeOnly: boolean = true) {
        return await prisma.newsletterSubscriber.findMany({
            where: {
                userId,
                ...(activeOnly && { isActive: true }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Stats des abonnés
    static async getStats(userId: string) {
        const all = await prisma.newsletterSubscriber.findMany({
            where: { userId },
        });

        return {
            total: all.length,
            active: all.filter(s => s.isActive).length,
            inactive: all.filter(s => !s.isActive).length,
        };
    }

    // Envoyer une newsletter (simulation - dans la vraie vie, utiliser un service d'email)
    static async sendNewsletter(userId: string, data: {
        subject: string;
        content: string;
    }) {
        const subscribers = await this.getSubscribers(userId, true);

        if (subscribers.length === 0) {
            throw new Error('No active subscribers');
        }

        // Dans une vraie implémentation, on utiliserait Nodemailer ou un service comme SendGrid
        console.log(`Sending newsletter to ${subscribers.length} subscribers`);
        console.log(`Subject: ${data.subject}`);
        console.log(`Content: ${data.content.substring(0, 100)}...`);

        // Simuler l'envoi réussi
        return {
            sent: subscribers.length,
            subject: data.subject,
            timestamp: new Date(),
        };
    }
}
