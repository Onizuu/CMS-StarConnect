import { TwitterApi } from 'twitter-api-v2';
import { PrismaClient } from '@prisma/client';
import { EncryptionService } from './EncryptionService.js';

const prisma = new PrismaClient();

export class TwitterService {
    private static getClient(accessToken?: string, accessSecret?: string) {
        if (accessToken && accessSecret) {
            return new TwitterApi({
                appKey: process.env.TWITTER_API_KEY!,
                appSecret: process.env.TWITTER_API_SECRET!,
                accessToken,
                accessSecret,
            });
        }

        return new TwitterApi({
            appKey: process.env.TWITTER_API_KEY!,
            appSecret: process.env.TWITTER_API_SECRET!,
        });
    }

    static getAuthLink(callbackUrl: string): string {
        const client = this.getClient();
        // Pour OAuth 1.0a (Twitter v1.1)
        // Note: Pour une vraie implémentation, il faudrait générer et stocker le oauth_token
        return `https://twitter.com/oauth/authorize?oauth_token=TOKEN_PLACEHOLDER&${callbackUrl}`;
    }

    static async verifyCallback(oauthToken: string, oauthVerifier: string): Promise<{
        accessToken: string;
        accessSecret: string;
        userId: string;
        screenName: string;
    }> {
        // Implémentation simplifiée - dans la vraie version, on utiliserait OAuth 1.0a
        throw new Error('OAuth flow not yet fully implemented - requires app credentials');
    }

    static async connectAccount(userId: string, data: {
        accessToken: string;
        accessSecret: string;
        twitterUserId: string;
        username: string;
    }) {
        const encryptedToken = EncryptionService.encrypt(data.accessToken);
        const encryptedSecret = EncryptionService.encrypt(data.accessSecret);

        return await prisma.socialAccount.upsert({
            where: {
                userId_platform: {
                    userId,
                    platform: 'TWITTER',
                },
            },
            create: {
                userId,
                platform: 'TWITTER',
                platformUserId: data.twitterUserId,
                username: data.username,
                accessToken: encryptedToken,
                refreshToken: encryptedSecret,
                isActive: true,
            },
            update: {
                accessToken: encryptedToken,
                refreshToken: encryptedSecret,
                username: data.username,
                isActive: true,
            },
        });
    }

    static async publishTweet(userId: string, text: string, mediaIds?: string[]): Promise<{
        id: string;
        url: string;
    }> {
        const account = await prisma.socialAccount.findUnique({
            where: {
                userId_platform: {
                    userId,
                    platform: 'TWITTER',
                },
            },
        });

        if (!account || !account.isActive) {
            throw new Error('Twitter account not connected');
        }

        const accessToken = EncryptionService.decrypt(account.accessToken);
        const accessSecret = EncryptionService.decrypt(account.refreshToken!);

        const client = this.getClient(accessToken, accessSecret);
        const v2Client = client.v2;

        try {
            // Publier le tweet
            const tweetPayload: any = { text };
            if (mediaIds && mediaIds.length > 0) {
                tweetPayload.media = { media_ids: mediaIds.slice(0, 4) as [string] | [string, string] | [string, string, string] | [string, string, string, string] };
            }

            const tweet = await v2Client.tweet(tweetPayload);

            return {
                id: tweet.data.id,
                url: `https://twitter.com/${account.username}/status/${tweet.data.id}`,
            };
        } catch (error: any) {
            throw new Error(`Failed to post tweet: ${error.message}`);
        }
    }

    static async getUserTweets(userId: string, maxResults: number = 10): Promise<any[]> {
        const account = await prisma.socialAccount.findUnique({
            where: {
                userId_platform: {
                    userId,
                    platform: 'TWITTER',
                },
            },
        });

        if (!account || !account.isActive) {
            return [];
        }

        const accessToken = EncryptionService.decrypt(account.accessToken);
        const accessSecret = EncryptionService.decrypt(account.refreshToken!);

        const client = this.getClient(accessToken, accessSecret);
        const v2Client = client.v2;

        try {
            const tweets = await v2Client.userTimeline(account.platformUserId, {
                max_results: maxResults,
                'tweet.fields': ['created_at', 'public_metrics'],
            });

            return tweets.data.data || [];
        } catch (error: any) {
            console.error('Failed to fetch tweets:', error);
            return [];
        }
    }
}
