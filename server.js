const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// --- 1. POSTGRES CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- 2. EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

// --- 3. DATABASE INITIALIZATION ---
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
      staff_name VARCHAR(100) DEFAULT 'Admin',
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
    await client.query(createTablesQuery);
    console.log("✅ PostgreSQL Tables Verified");
    client.release();
  } catch (err) {
    console.error("❌ DB Initialization Error:", err.message);
  }
};

initializeDatabase();

// --- 4. API ROUTES ---

app.get('/', (req, res) => res.send('Bango Food Hub Backend is Running...'));

// SALES ROUTE (For the POS Screen)
app.post('/api/sales', async (req, res) => {
  try {
    const { items, total_price, payment_method, staff_name } = req.body;
    
    const newSale = await pool.query(
      `INSERT INTO sales (items, total_price, payment_method, staff_name) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [JSON.stringify(items), total_price, payment_method, staff_name]
    );

    res.status(201).json(newSale.rows[0]);
  } catch (err) {
    console.error("❌ Sale Error:", err.message);
    res.status(500).json({ error: "Could not record sale" });
  }
});

// ORDERS ROUTE (For the Frontend Checkout)
app.post('/api/orders', async (req, res) => {
    try {
      const { fullName, phone, email, address, grandTotal, paymentStatus, items } = req.body;
      
      const newOrder = await pool.query(
        `INSERT INTO orders (full_name, phone, email, address, grand_total, payment_status, items) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [fullName, phone, email, address, grandTotal, paymentStatus, JSON.stringify(items)]
      );

      // EMAIL LOGIC
      if (email) {
        const mailOptions = {
          from: `"Bango Food Hub" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Order Confirmed! 🚀 - Bango Food Hub',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
              <h1 style="color: #ea580c;">Bango Food Hub</h1>
              <h2>Order Received, ${fullName}!</h2>
              <p>Total: ₦${Number(grandTotal).toLocaleString()}</p>
              <p>Delivery to: ${address}</p>
              <hr />
              <p>We are preparing your meal now.</p>
            </div>
          `
        };
        await transporter.sendMail(mailOptions);
      }
  
      res.status(201).json(newOrder.rows[0]);
    } catch (err) {
      console.error("Order Error:", err.message);
      res.status(500).json({ error: "Order failed" });
    }
});

// GET PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Bango Food Hub server spinning on port ${PORT}`);
});