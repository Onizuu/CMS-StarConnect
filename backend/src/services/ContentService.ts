import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
const prisma = new PrismaClient();
interface CreateContentData {
  userId: string;
  type: string;
  title: string;
  body: any;
  excerpt?: string;
  status?: string;
}
export class ContentService {
  static async createContent(data: CreateContentData) {
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
  static async getContent(id: string) {
    return await prisma.content.findUnique({ where: { id } });
  }
  static async listContent(userId?: string) {
    const where = userId ? { userId } : { status: 'PUBLISHED' };
    return await prisma.content.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
  static async updateContent(id: string, userId: string, data: any) {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Access denied');
    }
    return await prisma.content.update({
      where: { id },
      data: { ...data, slug: data.title ? slugify(data.title, { lower: true, strict: true }) : undefined },
    });
  }
  static async deleteContent(id: string, userId: string) {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Access denied');
    }
    await prisma.content.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
