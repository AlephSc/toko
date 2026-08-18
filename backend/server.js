import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'change-this-in-production-to-random-32-char-string',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

const db = new Database('./backend/store.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    stock INTEGER DEFAULT 0,
    image_url TEXT
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'unpaid',
    payment_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL
  );
`);

// Seed products
const seedStmt = db.prepare('SELECT COUNT(*) as count FROM products');
if (seedStmt.get().count === 0) {
  const insert = db.prepare('INSERT INTO products (name, price, description, stock) VALUES (?, ?, ?, ?)');
  insert.run('E-Book Premium', 50000, 'E-book panduan lengkap digital marketing', 999);
  insert.run('Video Course', 100000, 'Video tutorial web development', 999);
  insert.run('Template Website', 75000, 'Template website siap pakai', 999);
}

function auth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Auth endpoints
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json({ error: 'Username min 3 chars, password min 6 chars' });
  }
  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)').run(username, hashed, email || null);
    req.session.userId = result.lastInsertRowid;
    req.session.username = username;
    res.json({ success: true, userId: result.lastInsertRowid, username });
  } catch (e) {
    res.status(409).json({ error: 'Username already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ success: true, username: user.username });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(req.session.userId);
  res.json(user);
});

// Products
app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT id, name, price, description, stock, image_url FROM products').all();
  res.json(products);
});

app.post('/api/products', auth, (req, res) => {
  const { name, price, description, stock, image_url } = req.body;
  if (!name || !price || price < 0) return res.status(400).json({ error: 'Invalid product data' });
  const result = db.prepare('INSERT INTO products (name, price, description, stock, image_url) VALUES (?, ?, ?, ?, ?)').run(
    name, price, description || '', stock || 0, image_url || null
  );
  res.json({ success: true, productId: result.lastInsertRowid });
});

// Cart
app.get('/api/cart', (req, res) => {
  const cart = req.session.cart || [];
  res.json(cart);
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity || quantity < 1) return res.status(400).json({ error: 'Invalid cart data' });
  
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  const cart = req.session.cart || [];
  const existing = cart.find(i => i.productId === productId);
  
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity
    });
  }
  
  req.session.cart = cart;
  res.json({ success: true, cart });
});

app.delete('/api/cart/:productId', (req, res) => {
  req.session.cart = (req.session.cart || []).filter(i => i.productId !== parseInt(req.params.productId));
  res.json({ success: true, cart: req.session.cart });
});

// Checkout & Payment Gateway Stub
app.post('/api/checkout', auth, (req, res) => {
  const userId = req.session.userId;
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  let total = 0;
  const orderItems = [];

  for (const item of cart) {
    const product = db.prepare('SELECT price, stock FROM products WHERE id = ?').get(item.productId);
    if (!product) continue;
    const itemTotal = product.price * item.quantity;
    total += itemTotal;
    orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
  }

  // ponytail: payment gateway integration, add when payment provider selected
  const paymentUrl = `http://localhost:3001/payment/${Date.now()}`;
  
  const orderResult = db.prepare('INSERT INTO orders (user_id, total, status, payment_status, payment_url) VALUES (?, ?, ?, ?, ?)').run(
    userId, total, 'pending', 'unpaid', paymentUrl
  );
  const orderId = orderResult.lastInsertRowid;

  const itemStmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
  for (const item of orderItems) {
    itemStmt.run(orderId, item.productId, item.quantity, item.price);
  }

  req.session.cart = [];

  res.json({
    success: true,
    orderId,
    total,
    paymentUrl,
    invoice: {
      orderId,
      userId,
      total,
      items: orderItems,
      createdAt: new Date().toISOString()
    }
  });
});

// Payment gateway stub
app.get('/payment/:id', (req, res) => {
  res.send(`
    <html>
      <head><title>Payment Gateway Stub</title></head>
      <body style="font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
        <h1>Payment Gateway (Stub)</h1>
        <p>Payment ID: ${req.params.id}</p>
        <p>Status: Menunggu integrasi payment gateway</p>
        <a href="http://localhost:3000">Kembali ke toko</a>
      </body>
    </html>
  `);
});

// Orders
app.get('/api/orders', auth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.session.userId);
  res.json(orders);
});

app.get('/api/orders/:id', auth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
  res.json({ ...order, items });
});

app.listen(PORT, () => {
  console.log(`Backend API: http://localhost:${PORT}`);
});
