const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const nodemailer = require('nodemailer');
require("dotenv").config();

const app = express();

// 1. MIDDLEWARE
app.use(cors()); 
app.use(express.json());

// 2. DATABASE CONNECTION (Optimized for Render/Neon)
const pool = new Pool({ 
   connectionString: process.env.DATABASE_URL,
  
   ssl: process.env.DATABASE_URL.includes("neon.tech") 
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

app.get("/", (req, res) => {
  res.status(200).send("Bango Backend is Live! 🚀");
});

// GET PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Products Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});
// Get Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_sale,
        JSON_OBJECT_AGG(payment_method, method_count) as methods
      FROM (
        SELECT payment_method, COUNT(*) as method_count, total_amount 
        FROM sales 
        GROUP BY payment_method, total_amount
      ) as subquery
    `);
    
    const recentSales = await pool.query("SELECT * FROM sales ORDER BY created_at DESC LIMIT 10");
    
    res.json({
      summary: stats.rows[0],
      recentSales: recentSales.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST NEW SALE (From POS)

app.post('/api/sales', async (req, res) => {
  
  const { items, total_amount, payment_method, staff_name } = req.body;
  
  try {
 const newSale = await pool.query(
    "INSERT INTO public.sales (items, total_amount, payment_method, staff_name) VALUES ($1, $2, $3, $4) RETURNING *",
    [JSON.stringify(items), total_amount, payment_method, staff_name]
);
    res.status(201).json(newSale.rows[0]);
  } catch (err) {
    console.error("Sale Recording Error:", err.message);
    res.status(500).json({ error: err.message }); // Sends the real error to the console
  }
});
// GET ALL SALES (For Management Dashboard)
app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sales ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST ONLINE ORDER
app.post('/api/orders', async (req, res) => {
  const { address, paymentMethod, subtotal, deliveryFee, grandTotal, items } = req.body;

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
      html: `<h2>New Order #${orderId}</h2><ul>${itemsListHtml}</ul><p>Address: ${address}</p>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, orderId });
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5001; 
app.listen(PORT, () => console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`));