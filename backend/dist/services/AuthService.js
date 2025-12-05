import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
export class AuthService {
    static async register(data) {
        // Vérifier si l'email existe
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error('Email already exists');
        }
        // Vérifier si le username existe
        const existingUsername = await prisma.user.findUnique({
            where: { username: data.username },
        });
        if (existingUsername) {
            throw new Error('Username already exists');
        }
        // Hash du password
        const hashedPassword = await bcrypt.hash(data.password, 10);
        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                password: hashedPassword,
                name: data.name,
            },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                role: true,
            },
        });
        // Générer les tokens
        const { accessToken, refreshToken } = await this.generateTokens(user.id);
        return { user, accessToken, refreshToken };
    }
    static async login(email, password) {
        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Vérifier le password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }
        // Générer les tokens
        const { accessToken, refreshToken } = await this.generateTokens(user.id);
        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }
    static async generateTokens(userId) {
        // Get user details for token
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, username: true },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Générer les tokens
        const accessToken = jwt.sign({ userId: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
        // Sauvegarder le refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });
        return { accessToken, refreshToken };
    }
    static async refreshAccessToken(refreshToken) {
        // Vérifier le token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // Vérifier qu'il existe en DB
        const tokenRecord = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!tokenRecord || !tokenRecord.user) {
            throw new Error('Invalid refresh token');
        }
        // Générer un nouveau access token
        const accessToken = jwt.sign({ userId: tokenRecord.userId, email: tokenRecord.user.email, username: tokenRecord.user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
        return { accessToken };
    }
    static async logout(refreshToken) {
        await prisma.refreshToken.delete({
            where: { token: refreshToken },
        });
    }
}
