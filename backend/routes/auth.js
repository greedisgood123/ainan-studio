import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/init.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDatabase();
    
    // Find admin user
    const admin = await db.get('SELECT * FROM admins WHERE email = ?', email);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store session in database
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    await db.run(
      'INSERT INTO admin_sessions (admin_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)',
      [admin.id, token, expiresAt, Date.now()]
    );

    // Clean up old sessions
    await db.run('DELETE FROM admin_sessions WHERE expires_at < ?', Date.now());

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token endpoint
router.get('/me', async (req, res) => {
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

    res.json({
      admin: {
        id: decoded.adminId,
        email: decoded.email
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const db = getDatabase();

    // Remove session
    await db.run('DELETE FROM admin_sessions WHERE token = ?', token);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Change password endpoint
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDatabase();

    // Get admin user
    const admin = await db.get('SELECT * FROM admins WHERE id = ?', decoded.adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await db.run(
      'UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?',
      [newPasswordHash, Date.now(), admin.id]
    );

    // Invalidate all sessions for this admin (force re-login)
    await db.run('DELETE FROM admin_sessions WHERE admin_id = ?', admin.id);

    res.json({ message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
