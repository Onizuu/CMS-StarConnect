import { PrismaClient } from '@prisma/client';
import { TwitterService } from './TwitterService.js';
const prisma = new PrismaClient();
export class SocialPublishService {
    static async publishToSocial(userId, contentId, platforms, scheduledFor) {
        // Create queue entry
        const queueEntry = await prisma.publishQueue.create({
            data: {
                userId,
                contentId,
                platforms,
                status: 'PENDING',
                scheduledFor,
            },
            include: {
                content: true,
            },
        });
        // If not scheduled, publish immediately
        if (!scheduledFor) {
            await this.processQueueItem(queueEntry.id);
        }
        return queueEntry;
    }
    static async processQueueItem(queueId) {
        const queueItem = await prisma.publishQueue.findUnique({
            where: { id: queueId },
            include: { content: true, user: true },
        });
        if (!queueItem) {
            throw new Error('Queue item not found');
        }
        if (queueItem.status !== 'PENDING') {
            return; // Already processed
        }
        await prisma.publishQueue.update({
            where: { id: queueId },
            data: { status: 'PROCESSING' },
        });
        const platforms = queueItem.platforms;
        const errors = [];
        const successes = [];
        for (const platform of platforms) {
            try {
                let result;
                if (platform === 'TWITTER') {
                    const text = `${queueItem.content.title}\n\n${queueItem.content.excerpt || ''}`;
                    result = await TwitterService.publishTweet(queueItem.userId, text);
                    // Save social post record
                    await prisma.socialPost.create({
                        data: {
                            userId: queueItem.userId,
                            contentId: queueItem.contentId,
                            platform: 'TWITTER',
                            platformPostId: result.id,
                            text,
                            url: result.url,
                            publishedAt: new Date(),
                        },
                    });
                    successes.push(`Twitter: ${result.url}`);
                }
                // Add other platforms here
            }
            catch (error) {
                errors.push(`${platform}: ${error.message}`);
            }
        }
        const finalStatus = errors.length === platforms.length ? 'FAILED' : 'COMPLETED';
        const errorMessage = errors.length > 0 ? errors.join('; ') : null;
        await prisma.publishQueue.update({
            where: { id: queueId },
            data: {
                status: finalStatus,
                error: errorMessage,
                processedAt: new Date(),
            },
        });
        return { successes, errors };
    }
    static async getQueue(userId) {
        return await prisma.publishQueue.findMany({
            where: { userId },
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
    static async cancelQueueItem(queueId, userId) {
        const item = await prisma.publishQueue.findUnique({
            where: { id: queueId },
        });
        if (!item || item.userId !== userId) {
            throw new Error('Unauthorized or not found');
        }
        if (item.status !== 'PENDING') {
            throw new Error('Can only cancel pending items');
        }
        await prisma.publishQueue.delete({
            where: { id: queueId },
        });
    }
}
