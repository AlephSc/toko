# Project Logs - Toko Digital

## Session: 2026-08-18

### Tujuan Project
- Website toko dengan payment gateway
- Siap ekspansi ke Telegram bot
- Database mudah backup/mirror (SQLite)
- Stack: Express API + Next.js frontend

### Keputusan Arsitektur
- Backend: Express API murni (port 3001)
- Frontend: Next.js SSR (port 3000)
- Database: SQLite file-based (`backend/store.db`)
- Session: express-session
- Auth: bcrypt
- CORS enabled untuk localhost:3000

### Struktur Final
```
toko/
├── backend/
│   ├── server.js          # Express API :3001
│   ├── backup.js          # DB backup script
│   └── store.db           # SQLite database
├── app/
│   ├── page.js            # Next.js main page
│   ├── layout.js          # Root layout
│   └── globals.css        # Tailwind styles
├── backups/               # Auto-created by backup script
├── package.json
├── next.config.mjs
└── tailwind.config.js
```

### Implementasi Selesai

#### 1. Backend API (backend/server.js)
- Port 3001
- CORS enabled
- Session-based auth
- Endpoints:
  - POST `/api/register` - user registration
  - POST `/api/login` - user login
  - POST `/api/logout` - logout
  - GET `/api/me` - current user (auth required)
  - GET `/api/products` - list products
  - POST `/api/products` - create product (auth required)
  - GET `/api/cart` - get cart
  - POST `/api/cart` - add to cart
  - DELETE `/api/cart/:id` - remove from cart
  - POST `/api/checkout` - checkout (auth required)
  - GET `/api/orders` - user orders (auth required)
  - GET `/api/orders/:id` - order detail (auth required)
  - GET `/payment/:id` - payment gateway stub

#### 2. Database Schema
- `users` - id, username, password (bcrypt), email, created_at
- `products` - id, name, price, description, stock, image_url
- `orders` - id, user_id, total, status, payment_status, payment_url, created_at
- `order_items` - id, order_id, product_id, quantity, price

Seed data: 3 produk default (E-Book, Video Course, Template)

#### 3. Frontend (Next.js)
- Port 3000
- Fetch ke backend API `http://localhost:3001`
- `credentials: 'include'` untuk session cookies
- Features:
  - Product listing
  - Cart management (add/remove)
  - Auth modal (login/register)
  - Checkout flow
  - Payment gateway redirect
- Glassmorphism design (existing)

#### 4. Backup Script (backend/backup.js)
- Copy `backend/store.db` ke `backups/store-{timestamp}.db`
- Run: `npm run backup`

#### 5. Package.json Scripts
- `npm run dev` - frontend only (port 3000)
- `npm run dev:backend` - backend only (port 3001)
- `npm run dev:all` - both (requires concurrently, belum tested)
- `npm run backup` - backup database

### Testing
- Backend: running, port 3001 ✓
- GET `/api/products` returns 200 OK ✓
- Frontend: running, port 3000 ✓
- Next.js dev server ready ✓

### Status Akhir
**✓ Implementasi complete**

Backend API terpisah dari frontend. Siap untuk:
1. Integrasi payment gateway (stub sudah ada)
2. Telegram bot (tinggal hit API sama)
3. Backup/mirror database (script tersedia)

### Notes
- SQLite file-based, mudah backup manual (copy file)
- Session menggunakan cookies, CORS configured
- Payment gateway stub return HTML page dengan payment ID
- Frontend fetch dengan `credentials: 'include'` untuk session persistence

### Next Steps (Optional)
1. Integrasi payment gateway real (Midtrans/Xendit/dll)
2. Telegram bot implementation
3. Admin dashboard untuk manage products
4. Order history page
5. Email notification
6. Automated backup cron/scheduler

---
