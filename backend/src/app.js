// src/app.js
const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const morgan       = require('morgan')
const path         = require('path')
const rateLimit    = require('express-rate-limit')

const routes = require('./routes/index')

const app = express()

// ── Security headers ──────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// ── CORS ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))

// ── Rate limiting ─────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again in 15 minutes.' },
})

app.use('/api', globalLimiter)
app.use('/api/auth/login',    authLimiter)
app.use('/api/auth/register', authLimiter)

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ── Static file serving for uploads ──────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ── API routes ────────────────────────────────────────────
app.use('/api', routes)

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err)

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(413).json({ error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 10}MB` })
  if (err.message?.startsWith('Unsupported file type'))
    return res.status(415).json({ error: err.message })

  // PG unique violation
  if (err.code === '23505')
    return res.status(409).json({ error: 'A record with that value already exists' })

  // PG foreign key violation
  if (err.code === '23503')
    return res.status(400).json({ error: 'Referenced record does not exist' })

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

module.exports = app
