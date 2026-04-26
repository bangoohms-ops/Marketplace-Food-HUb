const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is missing");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

// --- 4. DATABASE INITIALIZATION (With Auto-Correction) ---
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Use this to FORCE a reset if your table is stuck with old columns:
    // await client.query('DROP TABLE IF EXISTS sales CASCADE;'); 
    
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
    
    console.log("✅ PostgreSQL Tables Verified & Synced");
    client.release();
  } catch (err) {
    console.error("❌ DB Initialization Error:", err.message);
  }
};

initializeDatabase();

// --- 5. API ROUTES ---

app.get('/', (req, res) => res.send('Bango Food Hub Backend is Running...'));

app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch sales" });
  }
});

app.post('/api/sales', async (req, res) => {
  const { items, total_price, payment_method, staff_name } = req.body;
  
  if (!items || !total_price) {
    return res.status(400).json({ error: "Missing items or total price" });
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
                html: `<h1>Order Received, ${fullName}!</h1><p>Total: ₦${Number(grandTotal).toLocaleString()}</p>`
              };
              await transporter.sendMail(mailOptions);
        } catch (mErr) { console.error("Email fail:", mErr.message); }
      }
      res.status(201).json(newOrder.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Order failed" });
    }
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));