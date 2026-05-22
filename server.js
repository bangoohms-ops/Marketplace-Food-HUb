require('dotenv').config(); // MUST BE LINE 1 to load environment properties across all modules
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const pool = require('./db'); // Imports the connection manager cleanly

const app = express();
const PORT = process.env.PORT || 5001;

// --- GLOBAL MIDDLEWARE ---
// Explicitly configures authorized access channels to completely eliminate cross-origin blocks
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'https://betterchowng.netlify.app',   // Clean production URL
    'https://betterchowng.netlify.app/'  // Production URL with trailing slash fallback
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
    console.log("🐘 PostgreSQL Database Client Successfully Allocated From Pool");
    
    // Safely creates operational schemas without blowing away pre-existing data rows
    await client.query(`
      CREATE TABLE IF NOT EXISTS food_products (
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

      CREATE TABLE IF NOT EXISTS food_hub_orders (
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

// Base Health Check Link
app.get('/', (req, res) => res.send('Bango Food Hub Backend Core Engine Online.'));

// 1. GET ALL PRODUCTS (Used by Frontend Customer Menu)
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_products ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Fetch Products Error:", err.message);
    res.status(500).json({ error: "Failed to fetch menu data configurations." });
  }
});

// 2. GET SALES LEDGER RECORDS (Used by Admin Analytics Dashboard)
app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Fetch Sales Ledger Error:", err.message);
    res.status(500).json({ error: "Failed to read database transactional ledgers." });
  }
});

// 3. POST NEW TRANSACTIONS (Used by POS Screen)
app.post('/api/sales', async (req, res) => {
  try {
    const { items, total_price, payment_method, staff_name } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cannot process an empty cart layout." });
    }

    const queryText = `
      INSERT INTO sales (items, total_price, payment_method, staff_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [JSON.stringify(items), total_price, payment_method || 'Cash', staff_name || 'Admin'];
    const result = await pool.query(queryText, values);

    // 📧 AUTOMATED AUDIT ALERTS
    if (process.env.EMAIL_USER) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, 
        subject: `🔔 New Food Hub Sale - ₦${Number(total_price).toLocaleString()}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ea580c; margin-bottom: 0;">Fresh! Food Hub Audit</h2>
            <p style="font-size: 12px; color: #666; margin-top: 4px;">Maryland Location • Live POS Sourced</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p><strong>Amount Settled:</strong> ₦${Number(total_price).toLocaleString()}</p>
            <p><strong>Payment Framework:</strong> ${payment_method}</p>
            <p><strong>Processing Node:</strong> ${staff_name || 'Admin'}</p>
            <p style="font-size: 11px; color: #999; margin-top: 20px;">Secure Transaction ID Pool: Reference #${result.rows[0].id}</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error("⚠️ Nodemailer Delivery Alert Interruption:", error.message);
        else console.log("📧 Transaction alert logged securely to management inbox.");
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Process Sale Transaction Error:", err.message);
    res.status(500).json({ error: "Internal Server Database Write Failure." });
  }
});

// --- PORT EXECUTION LISTENER ---
app.listen(PORT, () => {
  console.log(`🚀 Core Server processing runtime operations on port: ${PORT}`);
});