import jwt from 'jsonwebtoken';
export const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.userId, username: decoded.username };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
