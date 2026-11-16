# VAYENTRA GURUKULA — PRODUCTION DEPLOYMENT & DISASTER RECOVERY MANUAL

**System Architecture:** Node.js Express 20+ LTS • SQLite 3 (WAL Mode) • React 18 SPA (Vite) • NGINX Reverse Proxy  
**Platform Scope:** Concept-Based Academic Coaching & Learning Platform for Classes 1–10  
**Compliance Standard:** India's Digital Personal Data Protection (DPDP) Act 2023 & TRAI DLT Guidelines  
**Primary Commercial SKU:** ₹599.00 / student / year Annual Foundation Pass (SAC Code 9992, 18% GST)  

---

## 1. Production Architecture Overview

```
                      [ HTTPS / Port 443 ]
                               │
                               ▼
                    [ NGINX Reverse Proxy ]
                     • SSL Termination (HSTS)
                     • Static Asset Cache (1y)
                     • Rate Limiting (auth / payments)
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
   [ Vite SPA Client (/dist) ]      [ Express API Cluster (:5001) ]
   • Role-guarded Learn Hub         • Auth & DPDP Consent Engine
   • Public Admission & Pricing     • HMAC-SHA256 Razorpay Gateway
   • Interactive Concept Explorers   • Unified Learning Progress (Classes 1–10)
                                                │
                                                ▼
                                    [ SQLite Database (WAL) ]
                                    • /server/db/vayentra.sqlite
                                    • Zero-downtime hot backups
```

---

## 2. Server Prerequisites

- **Operating System:** Ubuntu 22.04 LTS or Debian 12
- **Node.js:** Node.js v20.x LTS or higher
- **Package Manager:** `pnpm` or `npm` v10+
- **Process Manager:** `pm2` (`npm install -g pm2`)
- **Web Server:** `nginx` (`apt install nginx certbot python3-certbot-nginx`)
- **Database Utilities:** `sqlite3` (`apt install sqlite3`)

---

## 3. Production Deployment Step-by-Step

### Step 1: Clone Repository & Configure Environment
```bash
git clone -b yashdev https://github.com/chirag-83-snpsu/vayentra-gurukula-.git /var/www/vayentra-gurukula
cd /var/www/vayentra-gurukula

# Copy production environment template
cp .env.example .env
nano .env
```
Ensure the following variables are configured in `.env`:
- `NODE_ENV=production`
- `PORT=5001`
- `JWT_SECRET`: High-entropy 64-byte random string (`openssl rand -base64 32`)
- `RAZORPAY_KEY_ID`: Live Razorpay Key (`rzp_live_...`)
- `RAZORPAY_KEY_SECRET`: Live Secret Key
- `RAZORPAY_WEBHOOK_SECRET`: Live Webhook Secret
- `BUSINESS_GSTIN`: `29AABCV1234F1Z5`

### Step 2: Install Dependencies & Build Frontend
```bash
npm ci --production=false
npx tsc --noEmit
npm run build
```
The compiled SPA will be output to `/var/www/vayentra-gurukula/dist`.

### Step 3: Run Database Migrations
```bash
node server/index.js
```
The database engine automatically verifies schema integrity, runs missing migrations up to `023`, and publishes approved curriculum for Classes 1 to 10.

### Step 4: Configure PM2 Daemon
Create or update ecosystem configuration:
```bash
pm2 start server/index.js --name "vayentra-backend" --time
pm2 save
pm2 startup
```

### Step 5: Configure NGINX & SSL
```bash
sudo cp deploy/nginx/vayentra.conf /etc/nginx/sites-available/vayentra.conf
sudo ln -sf /etc/nginx/sites-available/vayentra.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Issue Let's Encrypt SSL Certificate
sudo certbot --nginx -d gurukula.vayentra.org -d www.gurukula.vayentra.org
```

---

## 4. Razorpay Webhook Configuration

In the [Razorpay Dashboard](https://dashboard.razorpay.com/app/webhooks):
1. Navigate to **Settings > Webhooks > Add New Webhook**.
2. **Webhook URL:** `https://gurukula.vayentra.org/api/v1/payments/webhook`
3. **Secret:** Matches `RAZORPAY_WEBHOOK_SECRET` in `.env`.
4. **Events to Subscribe:**
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
5. The handler runs idempotently and prevents double activation using unique `webhook_event_id` tracking.

---

## 5. Automated Backup Cron Configuration

Install a nightly automated cron job to take zero-downtime hot backups:
```bash
sudo crontab -e
```
Add the following line (runs daily at 02:00 AM IST):
```cron
0 2 * * * /var/www/vayentra-gurukula/scripts/backup_database.sh >> /var/log/vayentra_backup.log 2>&1
```

---

## 6. Disaster Recovery & Rollback Procedure

In the event of database corruption or hardware failure:

### Step 1: Identify the Latest Verified Backup
```bash
ls -lt /var/www/vayentra-gurukula/backups/vayentra_backup_*.sqlite
```

### Step 2: Stop Application Server
```bash
pm2 stop vayentra-backend
```

### Step 3: Execute Restoration Script
```bash
/var/www/vayentra-gurukula/scripts/restore_database.sh /var/www/vayentra-gurukula/backups/vayentra_backup_YYYYMMDD_HHMMSS.sqlite
```
The script will:
1. Verify the SHA-256 cryptographic checksum.
2. Run `PRAGMA integrity_check`.
3. Create a safety snapshot of the existing database.
4. Replace the database file, remove stale WAL logs, and run `VACUUM`.

### Step 4: Restart Backend & Verify
```bash
pm2 start vayentra-backend
curl -s http://localhost:5001/api/v1/health | jq .
```
Expected output:
```json
{
  "status": "healthy",
  "database": "connected",
  "integrity": "ok"
}
```

---

## 7. DPDP Act 2023 Child Safeguarding Verification

1. **Role Boundary Enforcement:**
   - Student accounts accessing adult or parent endpoints (`/api/v1/parent/*`, `/api/v1/admin/*`, `/api/v1/payments/*`) receive HTTP `403 STUDENT_ACCESS_DENIED`.
2. **Chatbot Prohibition for Minors:**
   - Unmoderated chatbot text inputs are stripped from student views.
3. **Cross-Learner Progress Isolation:**
   - Unified progress endpoint (`POST /api/v1/one-content/progress`) validates `req.user.studentId` against canonical student ID; attempting to record progress for another student is rejected with HTTP `403`.
