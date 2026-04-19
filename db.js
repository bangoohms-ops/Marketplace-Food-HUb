const express = require('express');
const cors = require('cors');
const pool = require('./db'); // This looks for your db.js file
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Get all products (Tomatoes, Yams, etc.)
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('API Error:', err.message);
    res.status(500).json({ error: "Server Error", details: err.message });
  }
});

// 2. Get delivery zones (Near vs Far logic)
app.get('/api/zones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM delivery_zones');
    res.json(result.rows);
  } catch (err) {
    console.error('API Error:', err.message);
    res.status(500).json({ error: "Server Error", details: err.message });
  }
});

// Root route to test if server is alive
app.get('/', (req, res) => {
  res.send('Bango Food Hub API is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});