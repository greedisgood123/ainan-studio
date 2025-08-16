import express from 'express';
import { getDatabase } from '../database/init.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Get published gallery items
router.get('/public', async (req, res) => {
  try {
    const db = getDatabase();
    
    // Get published gallery items, ordered by order_index
    const items = await db.all(`
      SELECT id, title, description, badge, icon_name, image_url, order_index
      FROM gallery_items 
      WHERE is_published = true 
      ORDER BY order_index ASC, created_at DESC
      LIMIT 20
    `);

    // Transform to match Convex API format
    const transformed = items.map(item => ({
      title: item.title,
      description: item.description,
      badge: item.badge,
      iconName: item.icon_name,
      imageUrl: item.image_url
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Get public gallery error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// Admin: Get all gallery items
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    
    const items = await db.all(`
      SELECT * FROM gallery_items 
      ORDER BY order_index ASC, created_at DESC
    `);

    res.json(items);
  } catch (error) {
    console.error('Get admin gallery error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// Admin: Create gallery item
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { title, description, badge, iconName, imageUrl, orderIndex, isPublished } = req.body;

    if (!title || !description || !badge || !iconName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDatabase();
    const now = Date.now();

    const result = await db.run(`
      INSERT INTO gallery_items (
        title, description, badge, icon_name, image_url, 
        order_index, is_published, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, description, badge, iconName, imageUrl || null,
      orderIndex || 0, isPublished || false, now, now
    ]);

    const newItem = await db.get('SELECT * FROM gallery_items WHERE id = ?', result.lastID);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create gallery item error:', error);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
});

// Admin: Update gallery item
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, badge, iconName, imageUrl, orderIndex, isPublished } = req.body;

    const db = getDatabase();
    
    // Check if item exists
    const existingItem = await db.get('SELECT id FROM gallery_items WHERE id = ?', id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (badge !== undefined) { updates.push('badge = ?'); values.push(badge); }
    if (iconName !== undefined) { updates.push('icon_name = ?'); values.push(iconName); }
    if (imageUrl !== undefined) { updates.push('image_url = ?'); values.push(imageUrl); }
    if (orderIndex !== undefined) { updates.push('order_index = ?'); values.push(orderIndex); }
    if (isPublished !== undefined) { updates.push('is_published = ?'); values.push(isPublished); }

    updates.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    await db.run(`UPDATE gallery_items SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedItem = await db.get('SELECT * FROM gallery_items WHERE id = ?', id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Update gallery item error:', error);
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

// Admin: Delete gallery item
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if item exists
    const existingItem = await db.get('SELECT id FROM gallery_items WHERE id = ?', id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    await db.run('DELETE FROM gallery_items WHERE id = ?', id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

export default router;
