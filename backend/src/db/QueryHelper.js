// src/db/QueryHelper.js
const { Pool } = require('pg')

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'stempath',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'shamila99004',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err)
})

// ── Query helpers ──────────────────────────────────────────
const db = {
  /** Run a parameterised query and return all rows */
  query: async (text, params) => {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    if (process.env.NODE_ENV === 'development') {
      console.log('DB query', { text: text.slice(0, 80), duration, rows: res.rowCount })
    }
    return res
  },

  /** Return first row or null */
  queryOne: async (text, params) => {
    const res = await pool.query(text, params)
    return res.rows[0] ?? null
  },

  /** Return all rows */
  queryAll: async (text, params) => {
    const res = await pool.query(text, params)
    return res.rows
  },

  /** Acquire a client for transactions */
  getClient: () => pool.connect(),

  /** Run callback inside a transaction; auto-commit or rollback */
  transaction: async (callback) => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },
}

module.exports = db
