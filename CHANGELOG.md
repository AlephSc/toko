# Changelog - Toko Digital

## Session: 2026-08-18

### 1. Restruktur Arsitektur
**Backend terpisah dari frontend**
- Backend Express API: `backend/server.js` (port 3001)
- Frontend Next.js: `app/` directory (port 3000)
- API endpoints independen, siap konsumsi web + bot Telegram

**Alasan**: Skalabilitas. Telegram bot tinggal hit endpoint sama. Payment gateway integration lebih bersih.

---

### 2. Cleanup Files
**Dihapus**:
- `app.js` (vanilla JS)
- `index.html` (vanilla HTML)
- `style.css` (vanilla CSS)
- `server.js` (hybrid lama)
- `app/api/` (Next.js API routes lama)
- `lib/` (folder lama)

**Alasan**: Hybrid confusing. Pilih Next.js SSR penuh.

---

### 3. Dependencies
**Ditambah di `package.json`**:
```json
{
  "dependencies": {
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "better-sqlite3": "^11.7.1",
    "next": "^14.2.16",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^11.11.11",
    "lucide-react": "^0.454.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "concurrently": "^9.1.2",
    "tailwindcss": "^3.4.14",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47"
  }
}
```

**Scripts**:
- `npm run dev` → Next.js (port 3000)
- `npm run dev:backend` → Express (port 3001)
- `npm run dev:all` → Both concurrent
- `npm run backup` → Backup SQLite

**Alasan**: Missing deps. Backend butuh Express stack, frontend Next.js.

---

### 4. Backend API (`backend/server.js`)
**Port**: 3001  
**CORS**: `http://localhost:3000`  
**Session**: `express-session` (cookie-based)  
**Auth**: bcrypt

**Endpoints**:
| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/api/register` | - | Register user |
| POST | `/api/login` | - | Login |
| POST | `/api/logout` | - | Logout |
| GET | `/api/me` | ✓ | Current user |
| GET | `/api/products` | - | List products |
| POST | `/api/products` | ✓ | Create product |
| GET | `/api/cart` | - | Get cart |
| POST | `/api/cart` | - | Add to cart |
| DELETE | `/api/cart/:id` | - | Remove from cart |
| POST | `/api/checkout` | ✓ | Checkout |
| GET | `/api/orders` | ✓ | User orders |
| GET | `/api/orders/:id` | ✓ | Order detail |
| GET | `/payment/:id` | - | Payment stub page |

**Alasan**: API murni. Siap hit dari web/bot/mobile.

---

### 5. Database (`backend/store.db`)
**SQLite file-based**

**Schema**:
```sql
users (id, username UNIQUE, password, email, created_at)
products (id, name, price, description, stock, image_url)
orders (id, user_id, total, status, payment_status, payment_url, created_at)
order_items (id, order_id, product_id, quantity, price)
```

**Seed data**:
- E-Book Premium (Rp 50.000)
- Video Course (Rp 100.000)
- Template Website (Rp 75.000)

**Alasan**: File-based. Mudah backup/mirror. No server setup.

---

### 6. Backup Script (`backend/backup.js`)
**Fungsi**: Copy `backend/store.db` → `backups/store-{timestamp}.db`

**Run**:
```bash
npm run backup
```

**Output**:
```
backups/store-2026-08-18T07-30-15-123Z.db
```

**Alasan**: Requirement user. DB mudah backup/mirror.

---

### 7. Frontend (`app/page.js`)
**Fetch ke**: `http://localhost:3001`  
**Credentials**: `include` (session cookies)

**Features**:
- Product listing
- Cart (add/remove)
- Auth modal (login/register)
- User display (username + logout)
- Checkout → payment redirect
- Invoice modal

**Alasan**: Next.js SSR. Fetch API backend terpisah.

---

### 8. Payment Gateway Stub
**Endpoint**: `GET /payment/:id`  
**Return**: HTML page dengan payment ID

**Placeholder**:
```javascript
// ponytail: payment gateway integration
// Ganti dengan Midtrans/Xendit/dll saat production
const paymentUrl = `http://localhost:3001/payment/${Date.now()}`;
```

**Alasan**: Stub dulu. Integrasi nanti sesuai provider.

---

### 9. Configuration Files
**Updated**:
- `package.json` → deps + scripts
- `next.config.mjs` → clean config (hapus warning)
- `.gitignore` → tambah `*.db`, `/backups`
- `README.md` → dokumentasi lengkap
- `logs.md` → session log

**Alasan**: Clean setup. Documentation.

---

### 10. Testing
**Verified**:
- Backend running ✓ (port 3001)
- Frontend running ✓ (port 3000)
- API endpoint `/api/products` → 200 OK ✓
- Dependencies installed ✓

**Manual test**:
```bash
curl http://localhost:3001/api/products
# Output: [{"id":1,"name":"E-Book Premium",...}]
```

**Alasan**: Verify sebelum serah terima.

---

## Struktur Final

```
toko/
├── backend/
│   ├── server.js          # Express API :3001
│   ├── backup.js          # DB backup script
│   └── store.db           # SQLite (gitignored)
├── app/
│   ├── page.js            # Main page (client component)
│   ├── layout.js          # Root layout
│   └── globals.css        # Tailwind
├── backups/               # DB backups (gitignored)
├── package.json           # Dependencies + scripts
├── next.config.mjs
├── tailwind.config.js
├── README.md              # Dokumentasi
├── logs.md                # Session log
└── CHANGELOG.md           # File ini
```

---

## Status Akhir
✓ Backend API terpisah (port 3001)  
✓ Frontend Next.js (port 3000)  
✓ SQLite file-based (`backend/store.db`)  
✓ Backup script (`npm run backup`)  
✓ Payment gateway stub  
✓ Auth (register/login/logout)  
✓ Cart management  
✓ Checkout flow  
✓ Documentation  

---

## Next Steps (Belum dikerjakan)
- [ ] Integrasi payment gateway real (Midtrans/Xendit)
- [ ] Telegram bot implementation
- [ ] Admin dashboard
- [ ] Order history page
- [ ] Email notification
- [ ] Automated backup scheduler (cron/systemd)
- [ ] Production deployment
- [ ] Environment variables (`.env`)
- [ ] Input sanitization
- [ ] Rate limiting
- [ ] HTTPS/SSL

---

## Cara Jalankan

**Development**:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev
```

**URLs**:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Payment stub: http://localhost:3001/payment/:id

**Backup DB**:
```bash
npm run backup
```

**Manual backup**:
```bash
copy backend\store.db backups\store-manual.db
```

---

## Catatan Teknis

1. **Session cookies**: `httpOnly`, `sameSite: lax`, CORS enabled
2. **Password**: bcrypt hash (salt rounds 10)
3. **Cart**: Session-based (server-side)
4. **Database**: SQLite WAL mode (auto)
5. **API**: REST-ful, JSON response
6. **Frontend**: Client component (`'use client'`)
7. **Payment**: Stub return HTML page

---

## Logs Implementasi

### Restruktur
- Buat folder `backend/`
- Hapus vanilla files (app.js, index.html, style.css, server.js)
- Hapus Next.js API routes (`app/api/`)
- Hapus folder `lib/`

### Package.json
- Tambah `type: "module"`
- Tambah deps: express, express-session, bcrypt, cors
- Tambah script: `dev:backend`, `dev:all`, `backup`
- Tambah concurrently (devDep)

### Backend
- Buat `backend/server.js` (Express API)
- Buat `backend/backup.js` (backup script)
- Setup SQLite schema + seed
- Implement endpoints (auth, products, cart, checkout, orders)
- Payment gateway stub

### Frontend
- Update `app/page.js` (fetch ke backend:3001)
- Update `app/layout.js` (metadata)
- Clean `next.config.mjs`
- Auth modal (login/register)
- Cart sidebar
- Invoice modal
- Payment redirect

### Config
- Update `.gitignore` (*.db, /backups)
- Update `README.md`
- Buat `logs.md`
- Buat `CHANGELOG.md`

### Testing
- Install deps (npm install timeout → manual)
- Start backend (bgp_011ec0209001U5q2JJiGg0GkSC)
- Start frontend (bgp_011ec7c2d001s0a2R0wddPISOE)
- Test endpoint `/api/products` → 200 OK

---

**Generated**: 2026-08-18T07:33:15+07:00
