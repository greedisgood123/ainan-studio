import express from 'express';
import { getDatabase } from '../database/init.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Get published packages
router.get('/public', async (req, res) => {
  try {
    const db = getDatabase();
    
    const packages = await db.all(`
      SELECT id, title, price, description, features, add_ons, is_popular, badge, order_index
      FROM packages 
      WHERE is_published = true 
      ORDER BY order_index ASC, created_at DESC
    `);

    // Parse JSON fields
    const transformed = packages.map(pkg => ({
      ...pkg,
      features: JSON.parse(pkg.features || '[]'),
      addOns: JSON.parse(pkg.add_ons || '[]')
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Get public packages error:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Admin: Get all packages
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    
    const packages = await db.all(`
      SELECT * FROM packages 
      ORDER BY order_index ASC, created_at DESC
    `);

    const transformed = packages.map(pkg => ({
      ...pkg,
      features: JSON.parse(pkg.features || '[]'),
      addOns: JSON.parse(pkg.add_ons || '[]')
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Get admin packages error:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Create package
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { title, price, description, features, addOns, isPopular, badge, orderIndex, isPublished } = req.body;

    if (!title || !price || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDatabase();
    const now = Date.now();

    const result = await db.run(`
      INSERT INTO packages (
        title, price, description, features, add_ons, is_popular, 
        badge, order_index, is_published, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, price, description, 
      JSON.stringify(features || []), 
      JSON.stringify(addOns || []),
      isPopular || false, badge || null, orderIndex || 0, 
      isPublished || false, now, now
    ]);

    const newPackage = await db.get('SELECT * FROM packages WHERE id = ?', result.lastID);
    res.status(201).json({
      ...newPackage,
      features: JSON.parse(newPackage.features || '[]'),
      addOns: JSON.parse(newPackage.add_ons || '[]')
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Failed to create package' });
  }
});

export default router;
