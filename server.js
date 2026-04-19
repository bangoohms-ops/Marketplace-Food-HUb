const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const nodemailer = require('nodemailer');
require("dotenv").config();

const app = express();

// 1. IMPROVED MIDDLEWARE
// This allows your Netlify frontend to communicate with your Render backend
app.use(cors({
    origin: "*", // Allows all origins - change this to your Netlify URL later for security
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// 2. DATABASE CONNECTION (With Error Logging)
const pool = new Pool({ 
   connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1")
        ? false 
        : { rejectUnauthorized: false }
});

pool.connect((err) => {
    if (err) console.error("❌ DB CONNECTION ERROR:", err.stack);
    else console.log("✅ DATABASE CONNECTED");
});

// 3. EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { 
    user: process.env.EMAIL_USER || 'enodienemmanuel@gmail.com', 
    pass: process.env.EMAIL_PASS || 'uvms mxaa lman yupu' 
  }
});

// --- ROUTES ---

// Health Check (To see if backend is live in browser)
app.get("/", (req, res) => res.send("Bango Backend is Live! 🚀"));

// 1. GET PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// 2. POST ORDER (Supporting both /api/order and /api/orders to be safe)
app.post(['/api/order', '/api/orders'], async (req, res) => {
  const { address, paymentMethod, subtotal, deliveryFee, grandTotal, items } = req.body;

  // Basic validation to prevent "Unexpected end of JSON"
  if (!items || !address) {
    return res.status(400).json({ error: "Missing order details" });
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

    // B. Format the items for the email
    const itemsListHtml = items.map(item => 
      `<li><strong>${item.name}</strong> (x${item.quantity}) - ₦${(item.price * item.quantity).toLocaleString()}</li>`
    ).join('');

    // C. Setup Email
    const mailOptions = {
      from: '"Bango Food Hub" <enodienemmanuel@gmail.com>',
      to: 'enodienemmanuel@gmail.com', // You get the notification
      subject: `🔥 NEW BANGO ORDER #${orderId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #16a34a;">Bango! New Order Received</h2>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <hr />
          <h3>Items Ordered:</h3>
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
    
    // E. SUCCESS RESPONSE (This stops the Netlify error)
    return res.status(200).json({ 
        success: true, 
        message: "Order received!", 
        orderId 
    });

  } catch (err) {
    console.error("Order Processing Error:", err);
    return res.status(500).json({ error: "Server failed to process order" });
  }
});

// Port configuration
const PORT = process.env.PORT || 5000; 
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BANGO BACKEND FLYING ON PORT ${PORT}`);
});