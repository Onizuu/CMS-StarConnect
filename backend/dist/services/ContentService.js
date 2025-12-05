import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
const prisma = new PrismaClient();
export class ContentService {
    static async createContent(data) {
        const slug = slugify(data.title, { lower: true, strict: true });
        const content = await prisma.content.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                slug,
                body: data.body,
                excerpt: data.excerpt,
                status: data.status || 'DRAFT',
                publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
            },
        });
        return content;
    }
    static async getContent(id) {
        return await prisma.content.findUnique({ where: { id } });
    }
    static async listContent(userId) {
        const where = userId ? { userId } : { status: 'PUBLISHED' };
        return await prisma.content.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    static async updateContent(id, userId, data) {
        const existing = await prisma.content.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            throw new Error('Access denied');
        }
        return await prisma.content.update({
            where: { id },
            data: { ...data, slug: data.title ? slugify(data.title, { lower: true, strict: true }) : undefined },
        });
    }
    static async deleteContent(id, userId) {
        const existing = await prisma.content.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            throw new Error('Access denied');
        }
        await prisma.content.delete({ where: { id } });
        return { message: 'Deleted' };
    }
}
