// Database Initialization Script
// Sets up the database schema and seed data

const fs = require('fs');
const path = require('path');
const { query } = require('./connection');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');

    // Read and execute schema
    console.log('📄 Reading schema.sql...');
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚡ Executing schema...');
    await query(schemaSQL);
    console.log('✅ Schema created successfully');

    // Read and execute seed data
    console.log('📄 Reading seedData.sql...');
    const seedPath = path.join(__dirname, '../../../database/seedData.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    console.log('🌱 Seeding data...');
    await query(seedSQL);
    console.log('✅ Seed data inserted successfully');

    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();