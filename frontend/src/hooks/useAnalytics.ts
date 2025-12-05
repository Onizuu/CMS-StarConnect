import { useEffect, useRef } from 'react';

interface AnalyticsOptions {
    page: string;
    contentId?: string;
    userId?: string;
}

export function useAnalytics({ page, contentId, userId }: AnalyticsOptions) {
    const startTime = useRef<number>(Date.now());
    const tracked = useRef<boolean>(false);

    useEffect(() => {
        // Track page view on mount
        if (!tracked.current) {
            trackPageView({
                page,
                contentId,
                userId,
                referrer: document.referrer || 'direct',
            });
            tracked.current = true;
        }

        // Track duration on unmount
        return () => {
            const duration = Math.round((Date.now() - startTime.current) / 1000);

            if (duration > 0) {
                trackPageView({
                    page,
                    contentId,
                    userId,
                    referrer: document.referrer || 'direct',
                    duration,
                });
            }
        };
    }, [page, contentId, userId]);
}

async function trackPageView(data: {
    page: string;
    contentId?: string;
    userId?: string;
    referrer: string;
    duration?: number;
}) {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/analytics/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (error) {
        // Fail silently - analytics should not break UX
        console.debug('Analytics tracking failed:', error);
    }
}
