import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CommentService {
    // Créer un commentaire
    static async createComment(data: {
        contentId: string;
        author: string;
        email?: string;
        text: string;
        parentId?: string;
    }) {
        // Vérifier que le contenu existe et est publié
        const content = await prisma.content.findUnique({
            where: { id: data.contentId },
        });

        if (!content || content.status !== 'PUBLISHED') {
            throw new Error('Content not found or not published');
        }

        return await prisma.comment.create({
            data: {
                contentId: data.contentId,
                author: data.author,
                email: data.email,
                text: data.text,
                parentId: data.parentId,
                status: 'PENDING', // Nécessite modération
            },
        });
    }

    // Obtenir les commentaires d'un contenu (approuvés uniquement pour public)
    static async getContentComments(contentId: string, includePending: boolean = false) {
        return await prisma.comment.findMany({
            where: {
                contentId,
                status: includePending ? undefined : 'APPROVED',
                parentId: null, // Seulement les commentaires racines
            },
            include: {
                replies: {
                    where: {
                        status: includePending ? undefined : 'APPROVED',
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Obtenir tous les commentaires pour modération (auth required)
    static async getAllComments(userId: string, status?: string) {
        return await prisma.comment.findMany({
            where: {
                content: {
                    userId,
                },
                ...(status && { status }),
            },
            include: {
                content: {
                    select: {
                        title: true,
                        slug: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Approuver un commentaire
    static async approveComment(commentId: string, userId: string) {
        // Vérifier que l'utilisateur est propriétaire du contenu
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { content: true },
        });

        if (!comment || comment.content.userId !== userId) {
            throw new Error('Unauthorized or comment not found');
        }

        return await prisma.comment.update({
            where: { id: commentId },
            data: { status: 'APPROVED' },
        });
    }

    // Rejeter un commentaire
    static async rejectComment(commentId: string, userId: string) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { content: true },
        });

        if (!comment || comment.content.userId !== userId) {
            throw new Error('Unauthorized or comment not found');
        }

        return await prisma.comment.update({
            where: { id: commentId },
            data: { status: 'REJECTED' },
        });
    }

    // Supprimer un commentaire
    static async deleteComment(commentId: string, userId: string) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { content: true },
        });

        if (!comment || comment.content.userId !== userId) {
            throw new Error('Unauthorized or comment not found');
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });
    }

    // Marquer comme spam
    static async markAsSpam(commentId: string, userId: string) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { content: true },
        });

        if (!comment || comment.content.userId !== userId) {
            throw new Error('Unauthorized or comment not found');
        }

        return await prisma.comment.update({
            where: { id: commentId },
            data: { status: 'SPAM' },
        });
    }

    // Stats des commentaires
    static async getCommentStats(userId: string) {
        const comments = await prisma.comment.findMany({
            where: {
                content: {
                    userId,
                },
            },
        });

        return {
            total: comments.length,
            pending: comments.filter(c => c.status === 'PENDING').length,
            approved: comments.filter(c => c.status === 'APPROVED').length,
            rejected: comments.filter(c => c.status === 'REJECTED').length,
            spam: comments.filter(c => c.status === 'SPAM').length,
        };
    }
}
