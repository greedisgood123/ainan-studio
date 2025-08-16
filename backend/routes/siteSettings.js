import express from 'express';
import { getDatabase } from '../database/init.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get hero settings
router.get('/hero', async (req, res) => {
  try {
    const db = getDatabase();
    
    const settings = await db.get(`
      SELECT * FROM site_settings WHERE key = 'hero'
    `);

    if (!settings) {
      return res.json({
        mp4Url: null,
        webmUrl: null,
        posterUrl: null
      });
    }

    res.json({
      mp4Url: settings.mp4_url,
      webmUrl: settings.webm_url,
      posterUrl: settings.poster_url
    });
  } catch (error) {
    console.error('Get hero settings error:', error);
    res.status(500).json({ error: 'Failed to fetch hero settings' });
  }
});

// Update hero settings
router.post('/hero', authenticateAdmin, async (req, res) => {
  try {
    const { mp4Url, webmUrl, posterUrl } = req.body;
    const db = getDatabase();
    const now = Date.now();

    // Upsert settings
    await db.run(`
      INSERT OR REPLACE INTO site_settings (key, mp4_url, webm_url, poster_url, updated_at)
      VALUES ('hero', ?, ?, ?, ?)
    `, [mp4Url || null, webmUrl || null, posterUrl || null, now]);

    res.json({ message: 'Hero settings updated successfully' });
  } catch (error) {
    console.error('Update hero settings error:', error);
    res.status(500).json({ error: 'Failed to update hero settings' });
  }
});

export default router;
