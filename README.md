# Toko Digital

E-commerce website dengan payment gateway, siap ekspansi ke Telegram bot.

## Stack

- **Backend**: Express API (port 3001)
- **Frontend**: Next.js 14 (port 3000)
- **Database**: SQLite (file-based)
- **Auth**: bcrypt + express-session
- **UI**: Tailwind CSS + Framer Motion

## Setup

```bash
npm install
```

## Development

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev
```

Backend: http://localhost:3001
Frontend: http://localhost:3000

## Database Backup

```bash
npm run backup
```

Creates timestamped backup in `backups/` folder.

Manual backup: copy `backend/store.db` file.

## API Endpoints

### Public
- `GET /api/products` - List products
- `POST /api/register` - Register user
- `POST /api/login` - Login
- `POST /api/logout` - Logout

### Authenticated
- `GET /api/me` - Current user
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/:id` - Remove from cart
- `POST /api/checkout` - Checkout & create order
- `GET /api/orders` - User orders
- `GET /api/orders/:id` - Order detail

### Payment (Stub)
- `GET /payment/:id` - Payment gateway stub page

## Database Schema

### users
- id, username (unique), password (bcrypt), email, created_at

### products
- id, name, price, description, stock, image_url

### orders
- id, user_id, total, status, payment_status, payment_url, created_at

### order_items
- id, order_id, product_id, quantity, price

## Features

✓ Product listing
✓ Shopping cart (session-based)
✓ User authentication (register/login)
✓ Checkout flow
✓ Payment gateway stub
✓ Order management
✓ Database backup script

## Roadmap

- [ ] Payment gateway integration (Midtrans/Xendit)
- [ ] Telegram bot
- [ ] Admin dashboard
- [ ] Order history page
- [ ] Email notification
- [ ] Automated backup scheduler

## Notes

- SQLite file: `backend/store.db`
- Session cookies via CORS-enabled Express
- Frontend fetch uses `credentials: 'include'`
- Payment gateway stub returns HTML page (integrate real gateway later)
- Default seed: 3 products (E-Book, Video Course, Template)
