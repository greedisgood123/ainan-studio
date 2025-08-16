import express from 'express';
import { getDatabase } from '../database/init.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Get all client logos
router.get('/public', async (req, res) => {
  try {
    const db = getDatabase();
    
    const logos = await db.all(`
      SELECT id, name, logo_url, order_index
      FROM client_logos 
      ORDER BY order_index ASC, created_at DESC
    `);

    res.json(logos);
  } catch (error) {
    console.error('Get public logos error:', error);
    res.status(500).json({ error: 'Failed to fetch client logos' });
  }
});

// Admin: Get all logos
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    
    const logos = await db.all(`
      SELECT * FROM client_logos 
      ORDER BY order_index ASC, created_at DESC
    `);

    res.json(logos);
  } catch (error) {
    console.error('Get admin logos error:', error);
    res.status(500).json({ error: 'Failed to fetch client logos' });
  }
});

// Create logo
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, logoUrl, orderIndex } = req.body;

    if (!name || !logoUrl) {
      return res.status(400).json({ error: 'Name and logo URL are required' });
    }

    const db = getDatabase();
    const now = Date.now();

    const result = await db.run(`
      INSERT INTO client_logos (name, logo_url, order_index, created_at)
      VALUES (?, ?, ?, ?)
    `, [name, logoUrl, orderIndex || 0, now]);

    const newLogo = await db.get('SELECT * FROM client_logos WHERE id = ?', result.lastID);
    res.status(201).json(newLogo);
  } catch (error) {
    console.error('Create logo error:', error);
    res.status(500).json({ error: 'Failed to create logo' });
  }
});

export default router;
