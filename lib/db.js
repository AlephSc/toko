import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'store.db'));

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
    tag TEXT DEFAULT 'Digital Item',
    stock INTEGER DEFAULT 999
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_email TEXT,
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
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

const seedCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
if (seedCount === 0) {
  const insert = db.prepare('INSERT INTO products (name, price, description, tag, stock) VALUES (?, ?, ?, ?, ?)');
  insert.run('Pro UI Design System', 249000, 'Comprehensive Figma kits, 500+ glass components & tokens.', 'UI Kit', 999);
  insert.run('Fullstack Next.js Masterclass', 499000, 'Build and ship production-ready web apps with modern stack.', 'Course', 999);
  insert.run('SaaS Boilerplate Engine', 799000, 'Pre-configured auth, DB, payments, and mailing microservice.', 'Source Code', 999);
  insert.run('3D Glass Icon Collection', 149000, 'Ultra high-res liquid & glass styled 3D illustrations.', 'Graphics', 999);
}

export default db;
