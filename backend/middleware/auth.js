import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/init.js';

export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const db = getDatabase();

    // Check if session exists and is valid
    const session = await db.get(
      'SELECT s.*, a.email FROM admin_sessions s JOIN admins a ON s.admin_id = a.id WHERE s.token = ? AND s.expires_at > ?',
      [token, Date.now()]
    );

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add admin info to request
    req.admin = {
      id: decoded.adminId,
      email: decoded.email,
      token: token
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = {
        id: decoded.adminId,
        email: decoded.email,
        token: token
      };
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
