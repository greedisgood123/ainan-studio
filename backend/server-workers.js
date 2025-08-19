import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS configuration
app.use('*', cors({
  origin: [
    'https://ainan-studio-frontend.pages.dev',
    'https://your-frontend-domain.pages.dev',
    'https://your-custom-domain.com',
    'http://localhost:8080',
    'http://localhost:4173'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'cloudflare-workers'
  })
})

// Auth routes
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    // Check for required fields
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    // Get environment variables
    const adminEmail = c.env.ADMIN_EMAIL || 'admin@ainanstudio.com'
    const adminPassword = c.env.ADMIN_PASSWORD || 'admin123'
    
    // Simple authentication for Cloudflare Workers
    if (email === adminEmail && password === adminPassword) {
      // Generate a simple token (in production, use proper JWT)
      const token = `cf-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      return c.json({ 
        token,
        admin: { 
          id: 1,
          email: adminEmail 
        }
      })
    }
    
    return c.json({ error: 'Invalid credentials' }, 401)
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Login failed' }, 500)
  }
})

app.get('/api/auth/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401)
    }

    const token = authHeader.substring(7)
    
    // Simple token validation for Cloudflare Workers
    if (token.startsWith('cf-token-')) {
      return c.json({
        admin: {
          id: 1,
          email: c.env.ADMIN_EMAIL || 'admin@ainanstudio.com'
        }
      })
    }
    
    return c.json({ error: 'Invalid token' }, 401)
  } catch (error) {
    console.error('Token verification error:', error)
    return c.json({ error: 'Invalid token' }, 401)
  }
})

app.post('/api/auth/logout', async (c) => {
  // For Cloudflare Workers, we just return success
  // In a real implementation, you might want to blacklist the token
  return c.json({ message: 'Logged out successfully' })
})

// Gallery routes
app.get('/api/gallery', async (c) => {
  // Mock data for now
  const gallery = [
    {
      id: 1,
      title: "Wedding Photography",
      description: "Beautiful wedding moments captured",
      image_url: "/gallery/wedding.jpg",
      badge: "Popular",
      icon_name: "heart",
      order_index: 1,
      is_published: true
    },
    {
      id: 2,
      title: "Portrait Sessions",
      description: "Professional portrait photography",
      image_url: "/gallery/portrait.jpg",
      badge: "Featured",
      icon_name: "camera",
      order_index: 2,
      is_published: true
    }
  ]
  
  return c.json(gallery)
})

// Portfolio routes
app.get('/api/portfolio', async (c) => {
  // Mock data for now
  const portfolio = [
    {
      id: 1,
      title: "Wedding Collection",
      description: "Beautiful wedding photography",
      category: "wedding",
      cover_image_url: "/portfolio/wedding-cover.jpg",
      order_index: 1,
      is_published: true
    },
    {
      id: 2,
      title: "Portrait Collection",
      description: "Professional portraits",
      category: "portrait",
      cover_image_url: "/portfolio/portrait-cover.jpg",
      order_index: 2,
      is_published: true
    }
  ]
  
  return c.json(portfolio)
})

// Packages routes
app.get('/api/packages/public', async (c) => {
  // Mock data for now
  const packages = [
    {
      id: 1,
      title: "Basic Package",
      price: "$299",
      description: "Perfect for small events",
      features: ["2 hours coverage", "50 edited photos", "Online gallery"],
      add_ons: [],
      is_popular: false,
      order_index: 1,
      is_published: true
    },
    {
      id: 2,
      title: "Premium Package",
      price: "$599",
      description: "Complete coverage for your special day",
      features: ["Full day coverage", "200 edited photos", "Online gallery", "Print rights"],
      add_ons: [
        { name: "Engagement Session", price: "$150" },
        { name: "Wedding Album", price: "$200" }
      ],
      is_popular: true,
      order_index: 2,
      is_published: true
    }
  ]
  
  return c.json(packages)
})

// Bookings routes
app.post('/api/bookings', async (c) => {
  try {
    const booking = await c.req.json()
    
    // Create new booking
    const newBooking = {
      id: Date.now(),
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      desired_date: booking.desiredDate,
      package_name: booking.packageName,
      user_agent: booking.userAgent,
      status: 'pending',
      created_at: Date.now(),
      updated_at: Date.now()
    }
    
    // Get existing bookings from KV
    const existingBookings = await getBookingsFromKV(c.env.BOOKINGS_KV)
    
    // Add new booking
    existingBookings.push(newBooking)
    
    // Save back to KV
    await saveBookingsToKV(c.env.BOOKINGS_KV, existingBookings)
    
    console.log('✅ New booking created:', newBooking)
    console.log('📊 Total bookings:', existingBookings.length)
    
    return c.json(newBooking)
  } catch (error) {
    console.error('Booking creation error:', error)
    return c.json({ error: 'Failed to create booking' }, 500)
  }
})

app.get('/api/bookings/admin', async (c) => {
  try {
    // Get all bookings from KV storage
    const bookings = await getBookingsFromKV(c.env.BOOKINGS_KV)
    return c.json(bookings)
  } catch (error) {
    console.error('Error getting bookings:', error)
    return c.json({ error: 'Failed to get bookings' }, 500)
  }
})

// Helper functions for KV storage
async function getBookingsFromKV(kv) {
  try {
    const bookingsData = await kv.get('bookings', { type: 'json' })
    return bookingsData || []
  } catch (error) {
    console.error('Error getting bookings from KV:', error)
    return []
  }
}

async function saveBookingsToKV(kv, bookings) {
  try {
    await kv.put('bookings', JSON.stringify(bookings))
  } catch (error) {
    console.error('Error saving bookings to KV:', error)
  }
}

async function getUnavailableDatesFromKV(kv) {
  try {
    const datesData = await kv.get('unavailable_dates', { type: 'json' })
    return datesData || [
      { date_ms: Date.now() + 7 * 24 * 60 * 60 * 1000, reason: "Holiday" },
      { date_ms: Date.now() + 14 * 24 * 60 * 60 * 1000, reason: "Personal" }
    ]
  } catch (error) {
    console.error('Error getting unavailable dates from KV:', error)
    return [
      { date_ms: Date.now() + 7 * 24 * 60 * 60 * 1000, reason: "Holiday" },
      { date_ms: Date.now() + 14 * 24 * 60 * 60 * 1000, reason: "Personal" }
    ]
  }
}

async function saveUnavailableDatesToKV(kv, dates) {
  try {
    await kv.put('unavailable_dates', JSON.stringify(dates))
  } catch (error) {
    console.error('Error saving unavailable dates to KV:', error)
  }
}

// Unavailable dates
app.get('/api/bookings/unavailable-dates', async (c) => {
  try {
    const unavailableDates = await getUnavailableDatesFromKV(c.env.BOOKINGS_KV)
    return c.json(unavailableDates)
  } catch (error) {
    console.error('Error getting unavailable dates:', error)
    return c.json({ error: 'Failed to get unavailable dates' }, 500)
  }
})

app.post('/api/bookings/unavailable-dates', async (c) => {
  try {
    const { date_ms, reason } = await c.req.json()
    
    // Get existing unavailable dates from KV
    const unavailableDates = await getUnavailableDatesFromKV(c.env.BOOKINGS_KV)
    
    // Check if date already exists
    const existingIndex = unavailableDates.findIndex(d => d.date_ms === date_ms)
    if (existingIndex !== -1) {
      return c.json({ error: 'Date already blocked' }, 400)
    }
    
    // Add new unavailable date
    const newDate = {
      id: Date.now(),
      date_ms,
      reason,
      created_at: new Date().toISOString()
    }
    unavailableDates.push(newDate)
    
    // Save back to KV
    await saveUnavailableDatesToKV(c.env.BOOKINGS_KV, unavailableDates)
    
    return c.json(newDate)
  } catch (error) {
    console.error('Add unavailable date error:', error)
    return c.json({ error: 'Failed to add unavailable date' }, 500)
  }
})

app.delete('/api/bookings/unavailable-dates/:dateMs', async (c) => {
  try {
    const dateMs = parseInt(c.req.param('dateMs'))
    
    // Get existing unavailable dates from KV
    const unavailableDates = await getUnavailableDatesFromKV(c.env.BOOKINGS_KV)
    
    // Remove the date from the array
    const initialLength = unavailableDates.length
    const filteredDates = unavailableDates.filter(d => d.date_ms !== dateMs)
    
    if (filteredDates.length === initialLength) {
      return c.json({ error: 'Date not found' }, 404)
    }
    
    // Save back to KV
    await saveUnavailableDatesToKV(c.env.BOOKINGS_KV, filteredDates)
    
    return c.json({ message: 'Unavailable date removed successfully' })
  } catch (error) {
    console.error('Remove unavailable date error:', error)
    return c.json({ error: 'Failed to remove unavailable date' }, 500)
  }
})

// Site settings
app.get('/api/site-settings', async (c) => {
  const settings = {
    hero_mp4_url: "/hero-optimized.mp4",
    hero_webm_url: "",
    hero_poster_url: "",
    site_title: "Ainan Studio",
    site_description: "Professional Photography Services"
  }
  
  return c.json(settings)
})

// Analytics endpoint
app.post('/api/analytics/track', async (c) => {
  const analyticsData = await c.req.json()
  
  // Mock analytics tracking
  console.log('Analytics tracked:', analyticsData)
  
  return c.json({
    success: true,
    timestamp: new Date().toISOString()
  })
})

export default app
