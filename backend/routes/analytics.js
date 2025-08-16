import express from 'express';
import { getDatabase } from '../database/init.js';

const router = express.Router();

// Track analytics event
router.post('/track', async (req, res) => {
  try {
    const { type, path, userAgent, referrer } = req.body;

    if (!type || !path) {
      return res.status(400).json({ error: 'Type and path are required' });
    }

    const db = getDatabase();
    
    await db.run(`
      INSERT INTO analytics_events (type, path, user_agent, referrer, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, [type, path, userAgent || null, referrer || null, Date.now()]);

    res.json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Track analytics error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

export default router;
