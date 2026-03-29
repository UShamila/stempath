// Database Connection Utility
const { Pool } = require('pg');

const poolConfig = {
  host: (process.env.DB_HOST || 'localhost').trim(),
  port: process.env.DB_PORT || 5432,
  database: (process.env.DB_NAME || 'stempath_db').trim(),
  user: (process.env.DB_USER || 'postgres').trim(),
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Only add password if it's provided and not empty
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim()) {
  poolConfig.password = process.env.DB_PASSWORD.trim();
} else {
  poolConfig.password = null; // Explicitly set to null for trust auth
}

const pool = new Pool(poolConfig);

// Test database connection
const testConnection = async () => {
  console.log('🔍 Testing database connection using:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT}`);
  console.log(`   DB:   ${process.env.DB_NAME}`);
  console.log(`   User: ${(process.env.DB_USER||'').trim()}`);
  const pass = (process.env.DB_PASSWORD||'').trim();
  console.log(`   Password: ${pass ? pass.replace(/./g,'*') : '(not set)'}`);

  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Transaction helper
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    console.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    // Set the methods back to their old un-monkey-patched version
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection
};
