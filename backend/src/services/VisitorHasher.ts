import crypto from 'crypto';

export class VisitorHasher {
    static generateVisitorId(ip: string, userAgent: string): string {
        // Créer un hash anonyme sans stocker les données personnelles
        // Utilise IP + UserAgent pour identifier de manière pseudo-anonyme
        const data = `${ip}-${userAgent}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    static extractIp(req: any): string {
        // Gère les proxies et load balancers
        return (
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.headers['x-real-ip'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            '0.0.0.0'
        );
    }

    static extractUserAgent(req: any): string {
        return req.headers['user-agent'] || 'unknown';
    }

    static getVisitorIdFromRequest(req: any): string {
        const ip = this.extractIp(req);
        const userAgent = this.extractUserAgent(req);
        return this.generateVisitorId(ip, userAgent);
    }
}
