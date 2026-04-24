const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer'); // 1. Added Nodemailer
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- 2. EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Use Google App Password here
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
    console.log("✅ All Database Tables Verified");
    client.release();
  } catch (err) {
    console.error("❌ DB Error:", err.message);
  }
};

initializeDatabase();

// --- 4. API ROUTES ---

app.get('/', (req, res) => res.send('Bango Food Hub Backend is Running...'));

app.post('/api/orders', async (req, res) => {
    try {
      const { fullName, phone, email, address, grandTotal, paymentStatus, items } = req.body;
      
      // Save to DB
      const newOrder = await pool.query(
        `INSERT INTO orders (full_name, phone, email, address, grand_total, payment_status, items) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [fullName, phone, email, address, grandTotal, paymentStatus, JSON.stringify(items)]
      );

      // --- 5. SEND CONFIRMATION EMAIL ---
      const mailOptions = {
        from: `"Bango Food Hub" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Order Confirmed! 🚀 - Bango Food Hub',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
            <h1 style="color: #ea580c;">Bango!</h1>
            <h2>Thanks for your order, ${fullName}!</h2>
            <p>We've received your payment and our kitchen is getting to work.</p>
            <hr />
            <p><strong>Total Paid:</strong> ₦${grandTotal.toLocaleString()}</p>
            <p><strong>Delivery Address:</strong> ${address}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <hr />
            <p style="font-size: 12px; color: #666;">If you have any questions, reply to this email or chat us on WhatsApp.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log("📧 Confirmation Email Sent to:", email);
  
      res.status(201).json(newOrder.rows[0]);
    } catch (err) {
      console.error("Order/Email Error:", err.message);
      res.status(500).json({ error: "Order saved, but email failed." });
    }
});

// (Keep your /api/sales and /api/products routes as they were)

app.listen(PORT, () => {
  console.log(`🚀 Bango Food Hub server spinning on port ${PORT}`);
});