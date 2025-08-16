import express from 'express';
import { getDatabase } from '../database/init.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Create booking
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, desiredDate, packageName, userAgent } = req.body;

    if (!name || !email || !phone || !desiredDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDatabase();
    const now = Date.now();

    const result = await db.run(`
      INSERT INTO bookings (
        name, email, phone, desired_date, package_name, 
        user_agent, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, email, phone, desiredDate, packageName || null, userAgent || null, 'pending', now, now]);

    res.status(201).json({ 
      id: result.lastID,
      message: 'Booking request submitted successfully' 
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Admin: Get all bookings
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    
    const bookings = await db.all(`
      SELECT * FROM bookings 
      ORDER BY created_at DESC
    `);

    res.json(bookings);
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Admin: Update booking status
router.patch('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = getDatabase();
    
    await db.run(`
      UPDATE bookings 
      SET status = ?, updated_at = ? 
      WHERE id = ?
    `, [status, Date.now(), id]);

    const updatedBooking = await db.get('SELECT * FROM bookings WHERE id = ?', id);
    res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;
