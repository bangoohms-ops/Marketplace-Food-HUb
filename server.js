const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const nodemailer = require('nodemailer');
require("dotenv").config();

const app = express();

// 1. MIDDLEWARE
app.use(cors({
  origin: 'https://d-marketplace.netlify.app/',
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// 2. DATABASE CONNECTION
const pool = new Pool({ 
   connectionString: process.env.DATABASE_URL,
   ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
});

pool.connect((err) => {
    if (err) console.error("❌ DB CONNECTION ERROR:", err.stack);
    else console.log("✅ DATABASE CONNECTED");
});

// 3. EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

// --- ROUTES ---

app.get("/", (req, res) => res.send("Bango Backend is Live! 🚀"));

app.post('/api/order', async (req, res) => {
  const { address, paymentMethod, subtotal, deliveryFee, grandTotal, items } = req.body;

  // Validation
  if (!items || !address) {
    return res.status(400).json({ success: false, error: "Missing items or address" });
  }

  try {
    // A. Save to Database
    const query = `
      INSERT INTO orders (customer_address, payment_method, subtotal, delivery_fee, grand_total, items)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `;
    const values = [address, paymentMethod, subtotal, deliveryFee, grandTotal, JSON.stringify(items)];
    const result = await pool.query(query, values);
    const orderId = result.rows[0].id;

    // B. Format items for email
    const itemsListHtml = items.map(item => 
      `<li><strong>${item.name}</strong> (x${item.quantity}) - ₦${(item.price * item.quantity).toLocaleString()}</li>`
    ).join('');

    // C. Setup Email
    const mailOptions = {
      from: `"Bango Food Hub" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
      subject: `🔥 NEW BANGO ORDER #${orderId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #000;">Bango! New Order Received</h2>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <hr />
          <ul>${itemsListHtml}</ul>
          <hr />
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Payment:</strong> ${paymentMethod}</p>
          <p style="font-size: 20px; font-weight: bold;">Total: ₦${grandTotal.toLocaleString()}</p>
        </div>
      `
    };

    // D. Send Email
    await transporter.sendMail(mailOptions);
    
    // E. SUCCESS RESPONSE
    return res.status(200).json({ 
        success: true, 
        message: "Order received!", 
        orderId 
    });

  } catch (err) {
    console.error("Order Processing Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000; 
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BANGO BACKEND FLYING ON PORT ${PORT}`);
});