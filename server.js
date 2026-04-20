const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const nodemailer = require('nodemailer');
require("dotenv").config();

const app = express();

// 1. MIDDLEWARE & CORS CONFIGURATION
app.use(cors({
origin: ['https://d-marketplace.netlify.app', 'http://localhost:5173'],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options('*', cors()); 
app.use(express.json());

// 2. DATABASE CONNECTION
const pool = new Pool({ 
   connectionString: process.env.DATABASE_URL,
   ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost") 
    ? { rejectUnauthorized: false } 
    : false
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

// Root Route (This fixes the "Not Found" message)
app.get("/", (req, res) => {
  res.status(200).send("Bango Backend is Live! 🚀");
});

// 1. GET PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Products Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 2. POST ORDER
app.post('/api/order', async (req, res) => {
  const { address, paymentMethod, subtotal, deliveryFee, grandTotal, items } = req.body;

  if (!items || !address) {
    return res.status(400).json({ success: false, error: "Missing items or address" });
  }

  try {
    const query = `
      INSERT INTO orders (customer_address, payment_method, subtotal, delivery_fee, grand_total, items)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `;
    const values = [address, paymentMethod, subtotal, deliveryFee, grandTotal, JSON.stringify(items)];
    const result = await pool.query(query, values);
    const orderId = result.rows[0].id;

    const itemsListHtml = items.map(item => 
      `<li><strong>${item.name}</strong> (x${item.quantity}) - ₦${(item.price * item.quantity).toLocaleString()}</li>`
    ).join('');

    const mailOptions = {
      from: `"Bango Food Hub" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
      subject: `🔥 NEW ORDER #${orderId}`,
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

    await transporter.sendMail(mailOptions);
    
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

// 4. PORT BINDING (Fixed the 'onst' typo here)
const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
  console.log(`🚀 BANGO BACKEND FLYING ON PORT ${PORT}`);
});