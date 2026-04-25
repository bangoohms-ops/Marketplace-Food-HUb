const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

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

const initializeDatabase = async () => {
  const createTablesQuery = `
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
    console.error("❌ DB Error:", err.message);
  }
};
initializeDatabase();

// --- API ROUTES ---

// 1. GET ALL SALES (For CEO Dashboard)
app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch sales" });
  }
});

// 2. RECORD POS SALE
app.post('/api/sales', async (req, res) => {
  try {
    const { items, total_price, payment_method, staff_name } = req.body;
    const sanitizedItems = typeof items === 'string' ? items : JSON.stringify(items);
    const sanitizedTotal = parseFloat(total_price);

    const newSale = await pool.query(
      `INSERT INTO sales (items, total_price, payment_method, staff_name) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [sanitizedItems, sanitizedTotal, payment_method || 'Cash', staff_name || 'Admin']
    );
    res.status(201).json(newSale.rows[0]);
  } catch (err) {
    console.error("❌ Sale Error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// 3. ONLINE ORDERS
app.post('/api/orders', async (req, res) => {
  try {
    const { fullName, phone, email, address, grandTotal, paymentStatus, items } = req.body;
    const newOrder = await pool.query(
      `INSERT INTO orders (full_name, phone, email, address, grand_total, payment_status, items) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [fullName, phone, email, address, parseFloat(grandTotal), paymentStatus, JSON.stringify(items)]
    );

    if (email) {
      const mailOptions = {
        from: `"Bango Food Hub" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Order Confirmed! 🚀',
        html: `<h1 style="color: #ea580c;">Bango Food Hub</h1><p>Thanks ${fullName}, your order for ₦${grandTotal} is confirmed!</p>`
      };
      await transporter.sendMail(mailOptions);
    }
    res.status(201).json(newOrder.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Order failed" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server spinning on port ${PORT}`));