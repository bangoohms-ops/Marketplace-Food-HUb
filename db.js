
const { Pool } = require('pg');
process.setMaxListeners(0);
// --- 1. CONFIGURATION INTEGRITY CHECK ---
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is missing inside your active environment runtime.");
  process.exit(1);
}

// --- 2. INITIALIZE POSTGRESQL CONNECTION POOL ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Enforces secure SSL connection handling required for live Render cloud databases
  ssl: { rejectUnauthorized: false }
});

// --- 3. LIFECYCLE EVENT LISTENERS ---
pool.on('connect', () => {
  console.log('🐘 PostgreSQL Database Client Successfully Allocated From Pool');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected Idle Database Client Error:', err.message);
});

// --- 4. EXPORT ENGINE POOL MODULE ---
module.exports = pool;