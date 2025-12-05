import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProfileService {
    static async getUserProfile(username: string) {
        return await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                avatar: true,
                banner: true,
                socialLinks: true,
                isPublic: true,
                createdAt: true,
            },
        });
    }

    static async updateProfile(userId: string, data: {
        name?: string;
        bio?: string;
        avatar?: string;
        banner?: string;
        socialLinks?: any;
        customTheme?: any;
        isPublic?: boolean;
    }) {
        return await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                bio: true,
                avatar: true,
                banner: true,
                socialLinks: true,
                customTheme: true,
                isPublic: true,
            },
        });
    }

    static async getPublicContent(username: string) {
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true, isPublic: true },
        });

        if (!user || !user.isPublic) {
            return [];
        }

        return await prisma.content.findMany({
            where: {
                userId: user.id,
                status: 'PUBLISHED',
            },
            orderBy: { publishedAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                publishedAt: true,
                createdAt: true,
            },
        });
    }
}
