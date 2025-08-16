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
  const { email, password } = await c.req.json()
  
  // Simple authentication for now
  if (email === 'admin@ainanstudio.com' && password === 'admin123') {
    return c.json({ 
      token: 'mock-jwt-token',
      user: { email, role: 'admin' }
    })
  }
  
  return c.json({ error: 'Invalid credentials' }, 401)
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
  const booking = await c.req.json()
  
  // Mock booking creation
  return c.json({
    id: Date.now(),
    ...booking,
    created_at: new Date().toISOString()
  })
})

// Unavailable dates
app.get('/api/unavailable-dates', async (c) => {
  // Mock unavailable dates
  const unavailableDates = [
    { dateMs: Date.now() + 7 * 24 * 60 * 60 * 1000, reason: "Holiday" },
    { dateMs: Date.now() + 14 * 24 * 60 * 60 * 1000, reason: "Personal" }
  ]
  
  return c.json(unavailableDates)
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
