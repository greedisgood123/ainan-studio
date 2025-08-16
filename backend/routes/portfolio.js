import express from 'express';
import { getDatabase } from '../database/init.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Get published portfolio albums
router.get('/public', async (req, res) => {
  try {
    const { category } = req.query;
    const db = getDatabase();
    
    let query = `
      SELECT id, title, description, category, cover_image_url, order_index
      FROM portfolio_albums 
      WHERE is_published = true
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY order_index ASC, created_at DESC';

    const albums = await db.all(query, params);

    // Transform to match Convex API format
    const transformed = albums.map(album => ({
      ...album,
      coverUrl: album.cover_image_url
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Get public portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Admin: Get all albums
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    const albums = await db.all(`
      SELECT * FROM portfolio_albums 
      ORDER BY order_index ASC, created_at DESC
    `);
    res.json(albums);
  } catch (error) {
    console.error('Get admin portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Create album
router.post('/albums', authenticateAdmin, async (req, res) => {
  try {
    const { title, description, category, coverImageUrl, orderIndex, isPublished } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDatabase();
    const now = Date.now();

    const result = await db.run(`
      INSERT INTO portfolio_albums (
        title, description, category, cover_image_url, 
        order_index, is_published, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, category, coverImageUrl || null, orderIndex || 0, isPublished || false, now, now]);

    const newAlbum = await db.get('SELECT * FROM portfolio_albums WHERE id = ?', result.lastID);
    res.status(201).json(newAlbum);
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({ error: 'Failed to create album' });
  }
});

// Get album photos
router.get('/albums/:id/photos', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const photos = await db.all(`
      SELECT * FROM portfolio_photos 
      WHERE album_id = ? 
      ORDER BY order_index ASC, created_at DESC
    `, id);

    // Transform to match Convex API format
    const transformed = photos.map(photo => ({
      ...photo,
      imageUrl: photo.image_url
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Get album photos error:', error);
    res.status(500).json({ error: 'Failed to fetch album photos' });
  }
});

// Add photo to album
router.post('/albums/:id/photos', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, caption, orderIndex } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const db = getDatabase();
    const now = Date.now();

    const result = await db.run(`
      INSERT INTO portfolio_photos (album_id, image_url, caption, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, imageUrl, caption || null, orderIndex || 0, now, now]);

    const newPhoto = await db.get('SELECT * FROM portfolio_photos WHERE id = ?', result.lastID);
    res.status(201).json(newPhoto);
  } catch (error) {
    console.error('Add photo error:', error);
    res.status(500).json({ error: 'Failed to add photo' });
  }
});

export default router;
