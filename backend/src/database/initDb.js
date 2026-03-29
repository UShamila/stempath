// src/database/initDb.js
require('dotenv').config();
const fs   = require('fs')
const path = require('path')
const { Pool } = require('pg')

async function initDb() {
const pool = new Pool({
    user: process.env.DB_USER, // username
    host: process.env.DB_HOST, // database host
    database: process.env.DB_NAME, // name of the database
    password: process.env.DB_PASSWORD, // name of the database
    port: process.env.DB_PORT,
  })

  const client = await pool.connect()
  try {
    console.log('🔌 Connected to PostgreSQL')

    const schemaPath = path.join(__dirname, '../../../database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    await client.query(schema)
    console.log('✅ Schema applied')

    const seedPath = path.join(__dirname, '../../../database/seedData.sql')
    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf8')
      await client.query(seed)
      console.log('🌱 Seed data inserted')
    }

    console.log('🎉 Database initialisation complete')
  } catch (err) {
    console.error('❌ DB init error:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

initDb()
