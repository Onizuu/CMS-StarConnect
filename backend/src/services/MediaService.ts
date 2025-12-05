import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MediaService {
    static async createMedia(data: {
        userId: string;
        filename: string;
        mimetype: string;
        size: number;
        url: string;
        thumbnail?: string;
    }) {
        return await prisma.media.create({ data });
    }

    static async listMedia(userId?: string) {
        return await prisma.media.findMany({
            where: userId ? { userId } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
            },
        });
    }

    static async getMediaById(id: string) {
        return await prisma.media.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
            },
        });
    }

    static async deleteMedia(id: string, userId: string) {
        const media = await prisma.media.findUnique({ where: { id } });

        if (!media) {
            throw new Error('Media not found');
        }

        if (media.userId !== userId) {
            throw new Error('Unauthorized');
        }

        return await prisma.media.delete({ where: { id } });
    }
}
