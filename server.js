require('dotenv').config(); // MUST BE LINE 1 to load environment properties across all modules
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const pool = require('./db'); // Imports the connection manager cleanly

const app = express();
const PORT = process.env.PORT || 5001;

// --- GLOBAL MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- NODEMAILER CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

// --- DATABASE INITIALIZATION LAYER ---
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Safely creates operational schemas without blowing away pre-existing data rows
    await client.query(`
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
        staff_name VARCHAR(100) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT NOT NULL,
        grand_total DECIMAL(12, 2) NOT NULL,
        payment_status TEXT DEFAULT 'Pending',
        items JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("✅ PostgreSQL Tables Verified & Synced successfully!");
    client.release();
  } catch (err) {
    console.error("❌ DB Initialization Error:", err.message);
  }
};

initializeDatabase();

// --- API ROUTE MATRIX ---

// Base Check Link
app.get('/', (req, res) => res.send('Bango Food Hub Backend Core Engine Online.'));

// Get Sales Ledger Records
app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch sales record arrays." });
  }
});

// Record New Sale Event Entry
app.post('/api/sales', async (req, res) => {
  const { items, total_price, payment_method, staff_name } = req.body;
  if (!items || !total_price) {
    return res.status(400).json({ error: "Missing required transactional payload items or total valuation parameters." });
  }
  try {
    const newSale = await pool.query(
      `INSERT INTO sales (items, total_price, payment_method, staff_name) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
     [JSON.stringify(items), total_price, payment_method || 'Cash', staff_name || 'Admin']
    );
    res.status(201).json(newSale.rows[0]);
  } catch (err) {
    console.error("❌ Sale Insert Error:", err.message); 
    res.status(500).json({ error: err.message }); 
  }
});

// Route Order Creation Pipeline with Automated Email Receipt Engine
app.post('/api/orders', async (req, res) => {
    const { fullName, phone, email, address, grandTotal, paymentStatus, items } = req.body;
    try {
      const newOrder = await pool.query(
        `INSERT INTO orders (full_name, phone, email, address, grand_total, payment_status, items) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [fullName, phone, email, address, grandTotal, paymentStatus || 'Pending', JSON.stringify(items)]
      );

      if (email) {
        try {
            const mailOptions = {
                from: `"Bango Food Hub" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Order Confirmed! 🚀',
                html: `<h1>Order Received, ${fullName}!</h1><p>Total Transaction Summation: ₦${Number(grandTotal).toLocaleString()}</p>`
              };
              await transporter.sendMail(mailOptions);
        } catch (mErr) { 
          console.error("SMTP Email Dispatch Failure:", mErr.message); 
        }
      }
      res.status(201).json(newOrder.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Order integration routing failed." });
    }
});

// Fetch Available Catalog Products Array
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Listening Pipeline
app.listen(PORT, () => console.log(`🚀 Bango Food Hub Engine active on port: ${PORT}`));