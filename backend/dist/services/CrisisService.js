import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class CrisisService {
    static async getCrisisMode(userId) {
        let crisisMode = await prisma.crisisMode.findUnique({
            where: { userId },
        });
        // Créer un mode crise par défaut si n'existe pas
        if (!crisisMode) {
            crisisMode = await prisma.crisisMode.create({
                data: {
                    userId,
                    isActive: false,
                    title: 'Communication Urgente',
                    message: 'Une déclaration officielle sera publiée prochainement.',
                },
            });
        }
        return crisisMode;
    }
    static async updateCrisisTemplate(userId, data) {
        return await prisma.crisisMode.upsert({
            where: { userId },
            create: {
                userId,
                isActive: false,
                ...data,
            },
            update: data,
        });
    }
    static async activateCrisis(userId) {
        return await prisma.crisisMode.update({
            where: { userId },
            data: {
                isActive: true,
                activatedAt: new Date(),
            },
        });
    }
    static async deactivateCrisis(userId) {
        return await prisma.crisisMode.update({
            where: { userId },
            data: {
                isActive: false,
            },
        });
    }
    static async checkCrisisStatus(username) {
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });
        if (!user)
            return null;
        return await prisma.crisisMode.findUnique({
            where: { userId: user.id },
            select: {
                isActive: true,
                title: true,
                message: true,
                activatedAt: true,
            },
        });
    }
}
