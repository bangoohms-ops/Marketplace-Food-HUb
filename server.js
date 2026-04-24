const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- 1. Middleware (MUST BE AT TOP) ---
app.use(cors());
app.use(express.json());

// --- 2. Database Configuration ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

// Consolidated Database Initialization
const initializeDatabase = async () => {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(12, 2) NOT NULL,
      category VARCHAR(100),
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      items JSONB NOT NULL,
      total_price DECIMAL(12, 2) NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'Cash',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      full_name TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      grand_total DECIMAL(12, 2),
      payment_status TEXT,
      items JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    const client = await pool.connect();
    console.log("✅ Connected to Bango Food Hub Database");
    
    await client.query(createTablesQuery);
    console.log("✅ All Database Tables Verified (Products, Sales, Orders)");
    
    client.release();
  } catch (err) {
    console.error("❌ Database Initialization Error:", err.message);
  }
};

initializeDatabase();

// --- 3. API Routes ---

// Root route
app.get('/', (req, res) => {
  res.send('Bango Food Hub Backend is Running...');
});

// GET: Fetch all sales for the Dashboard
app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("GET Sales Error:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("GET Products Error:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST: Create a new sale from POS
app.post('/api/sales', async (req, res) => {
  try {
    const { items, total_price, payment_method } = req.body;

    if (!total_price) {
      return res.status(400).json({ error: "Total price is required" });
    }

    const newSale = await pool.query(
      'INSERT INTO sales (items, total_price, payment_method) VALUES ($1, $2, $3) RETURNING *',
      [JSON.stringify(items), total_price, payment_method || 'Cash']
    );
    
    res.status(201).json(newSale.rows[0]);
  } catch (err) {
    console.error("POST Sales Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST: NEW ORDERS FROM CHECKOUT
app.post('/api/orders', async (req, res) => {
    try {
      const { fullName, phone, email, address, grandTotal, paymentStatus, items } = req.body;
      
      const newOrder = await pool.query(
        `INSERT INTO orders (full_name, phone, email, address, grand_total, payment_status, items) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [fullName, phone, email, address, grandTotal, paymentStatus, JSON.stringify(items)]
      );
  
      console.log("📦 New Order Saved:", newOrder.rows[0].id);
      res.status(201).json(newOrder.rows[0]);
    } catch (err) {
      console.error("Order Save Error:", err.message);
      res.status(500).json({ error: "Failed to save order" });
    }
  });

// --- 4. Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Bango Food Hub server spinning on port ${PORT}`);
});