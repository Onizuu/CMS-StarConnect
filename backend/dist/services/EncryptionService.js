import crypto from 'crypto-js';
const ENCRYPTION_KEY = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY || 'default-key-for-dev-only-change-in-prod';
export class EncryptionService {
    static encrypt(text) {
        return crypto.AES.encrypt(text, ENCRYPTION_KEY).toString();
    }
    static decrypt(encryptedText) {
        const bytes = crypto.AES.decrypt(encryptedText, ENCRYPTION_KEY);
        return bytes.toString(crypto.enc.Utf8);
    }
}
