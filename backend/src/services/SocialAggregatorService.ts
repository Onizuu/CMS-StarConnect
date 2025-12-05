import { PrismaClient } from '@prisma/client';
import { TwitterService } from './TwitterService.js';

const prisma = new PrismaClient();

export class SocialAggregatorService {
    static async syncUserPosts(userId: string) {
        const results = {
            twitter: 0,
            facebook: 0,
            errors: [] as string[],
        };

        // Sync Twitter
        try {
            const tweets = await TwitterService.getUserTweets(userId, 20);

            for (const tweet of tweets) {
                // Vérifier si le post existe déjà
                const existing = await prisma.socialPost.findFirst({
                    where: {
                        userId,
                        platform: 'TWITTER',
                        platformPostId: tweet.id,
                        comments: tweet.public_metrics?.reply_count || 0,
                    },
                });
            }

            results.twitter = tweets.length;
        } catch (error: any) {
            results.errors.push(`Twitter: ${error.message}`);
        }

        // Add Facebook sync here

        return results;
    }

    static async getUnifiedFeed(username: string) {
        // Get user
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true, isPublic: true },
        });

        if (!user || !user.isPublic) {
            return [];
        }

        // Get all social posts
        const socialPosts = await prisma.socialPost.findMany({
            where: { userId: user.id },
            orderBy: { publishedAt: 'desc' },
            take: 50,
        });

        // Get StarConnect posts
        const starConnectPosts = await prisma.content.findMany({
            where: {
                userId: user.id,
                status: 'PUBLISHED',
            },
            orderBy: { publishedAt: 'desc' },
            take: 50,
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                publishedAt: true,
            },
        });

        // Merge and sort chronologically
        const unifiedFeed = [
            ...socialPosts.map(post => ({
                type: 'social',
                platform: post.platform,
                text: post.text,
                url: post.url,
                publishedAt: post.publishedAt,
                engagement: {
                    likes: post.likes,
                    shares: post.shares,
                    comments: post.comments,
                },
            })),
            ...starConnectPosts.map(post => ({
                type: 'starconnect',
                platform: 'STARCONNECT',
                text: post.title,
                excerpt: post.excerpt,
                url: `/p/${post.slug}`,
                publishedAt: post.publishedAt,
            })),
        ].sort((a, b) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
        });

        return unifiedFeed;
    }

    static async getEngagementStats(userId: string) {
        const socialPosts = await prisma.socialPost.findMany({
            where: { userId },
        });

        const stats = {
            totalPosts: socialPosts.length,
            totalLikes: socialPosts.reduce((sum, post) => sum + post.likes, 0),
            totalShares: socialPosts.reduce((sum, post) => sum + post.shares, 0),
            totalComments: socialPosts.reduce((sum, post) => sum + post.comments, 0),
            byPlatform: {} as Record<string, any>,
        };

        // Stats by platform
        for (const post of socialPosts) {
            if (!stats.byPlatform[post.platform]) {
                stats.byPlatform[post.platform] = {
                    posts: 0,
                    likes: 0,
                    shares: 0,
                    comments: 0,
                };
            }
            stats.byPlatform[post.platform].posts++;
            stats.byPlatform[post.platform].likes += post.likes;
            stats.byPlatform[post.platform].shares += post.shares;
            stats.byPlatform[post.platform].comments += post.comments;
        }

        return stats;
    }
}
