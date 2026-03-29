// server.js
require('dotenv').config()
const app = require('./src/app')
const db  = require('./src/db/QueryHelper')

const PORT = parseInt(process.env.PORT || '5000')

async function start() {
  // Verify database connection
  try {
    await db.query('SELECT 1')
    console.log('✅ Database connected')
  } catch (err) {
    console.error('❌ Database connection failed:', err.message)
    console.error('Make sure PostgreSQL is running and .env is configured correctly.')
    process.exit(1)
  }

  const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║         STEMPath API Server               ║
╠═══════════════════════════════════════════╣
║  🚀  Running on  http://localhost:${PORT}    ║
║  🌍  Environment: ${(process.env.NODE_ENV || 'development').padEnd(22)}║
║  📚  Docs:  /api/health                   ║
╚═══════════════════════════════════════════╝
    `)
  })

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully…`)
    server.close(() => {
      console.log('HTTP server closed.')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason)
  })
}

start()
