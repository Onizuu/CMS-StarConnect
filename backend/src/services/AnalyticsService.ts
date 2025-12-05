import { PrismaClient } from '@prisma/client';
import { VisitorHasher } from './VisitorHasher.js';

const prisma = new PrismaClient();

export class AnalyticsService {
    // Enregistrer une page view
    static async trackPageView(data: {
        page: string;
        contentId?: string;
        userId?: string;
        visitorId: string;
        referrer?: string;
        userAgent?: string;
        duration?: number;
    }) {
        return await prisma.pageView.create({
            data: {
                page: data.page,
                contentId: data.contentId,
                userId: data.userId,
                visitorId: data.visitorId,
                referrer: data.referrer,
                userAgent: data.userAgent,
                duration: data.duration,
            },
        });
    }

    // Stats globales pour un utilisateur
    static async getUserStats(userId: string, days: number = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const views = await prisma.pageView.findMany({
            where: {
                userId,
                createdAt: { gte: since },
            },
        });

        const totalViews = views.length;
        const uniqueVisitors = new Set(views.map(v => v.visitorId)).size;
        const avgDuration = views.filter(v => v.duration).length > 0
            ? Math.round(
                views
                    .filter(v => v.duration)
                    .reduce((sum, v) => sum + (v.duration || 0), 0) /
                views.filter(v => v.duration).length
            )
            : 0;

        // Views par jour
        const viewsByDay: Record<string, number> = {};
        views.forEach(view => {
            const day = view.createdAt.toISOString().split('T')[0];
            viewsByDay[day] = (viewsByDay[day] || 0) + 1;
        });

        // Top content
        const contentViews: Record<string, number> = {};
        views.forEach(view => {
            if (view.contentId) {
                contentViews[view.contentId] = (contentViews[view.contentId] || 0) + 1;
            }
        });

        const topContentIds = Object.entries(contentViews)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([id]) => id);

        const topContent = await prisma.content.findMany({
            where: { id: { in: topContentIds } },
            select: { id: true, title: true, slug: true },
        });

        const topContentWithViews = topContent.map(content => ({
            ...content,
            views: contentViews[content.id],
        }));

        // Top referrers
        const referrerCounts: Record<string, number> = {};
        views.forEach(view => {
            if (view.referrer && view.referrer !== 'direct') {
                try {
                    const url = new URL(view.referrer);
                    const domain = url.hostname;
                    referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
                } catch {
                    // Invalid URL, skip
                }
            }
        });

        const topReferrers = Object.entries(referrerCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([domain, count]) => ({ domain, count }));

        return {
            totalViews,
            uniqueVisitors,
            avgDuration,
            viewsByDay,
            topContent: topContentWithViews,
            topReferrers,
        };
    }

    // Stats pour un contenu spécifique
    static async getContentStats(contentId: string, days: number = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const views = await prisma.pageView.findMany({
            where: {
                contentId,
                createdAt: { gte: since },
            },
        });

        const totalViews = views.length;
        const uniqueVisitors = new Set(views.map(v => v.visitorId)).size;
        const avgDuration = views.filter(v => v.duration).length > 0
            ? Math.round(
                views
                    .filter(v => v.duration)
                    .reduce((sum, v) => sum + (v.duration || 0), 0) /
                views.filter(v => v.duration).length
            )
            : 0;

        // Views par jour
        const viewsByDay: Record<string, number> = {};
        views.forEach(view => {
            const day = view.createdAt.toISOString().split('T')[0];
            viewsByDay[day] = (viewsByDay[day] || 0) + 1;
        });

        return {
            totalViews,
            uniqueVisitors,
            avgDuration,
            viewsByDay,
        };
    }

    // Générer rapport exportable
    static async generateReport(userId: string, period: string = '30d') {
        const days = parseInt(period.replace('d', ''));
        const stats = await this.getUserStats(userId, days);

        return {
            period: `Last ${days} days`,
            generatedAt: new Date().toISOString(),
            summary: {
                totalViews: stats.totalViews,
                uniqueVisitors: stats.uniqueVisitors,
                avgDuration: `${stats.avgDuration}s`,
            },
            topContent: stats.topContent,
            topReferrers: stats.topReferrers,
            dailyViews: stats.viewsByDay,
        };
    }

    // Export CSV
    static async exportToCSV(userId: string, days: number = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const views = await prisma.pageView.findMany({
            where: {
                userId,
                createdAt: { gte: since },
            },
            include: {
                content: {
                    select: { title: true, slug: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const headers = ['Date', 'Page', 'Content', 'Referrer', 'Duration (s)'];
        const rows = views.map(view => [
            view.createdAt.toISOString(),
            view.page,
            view.content?.title || '-',
            view.referrer || 'direct',
            view.duration?.toString() || '-',
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        return csv;
    }
}
