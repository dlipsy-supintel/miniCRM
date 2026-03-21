# miniCRM Setup Guide

Complete setup from scratch to running locally or on your VPS.

---

## Prerequisites

- Node.js 20+
- A [Supabase Cloud](https://supabase.com) account (free tier is fine)
- A domain name (for VPS deployment) — optional for local dev

---

## Step 1 — Install Dependencies

```bash
cd ~/Projects/miniCRM
npm install
```

---

## Step 2 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a region close to your VPS
3. Save the database password somewhere safe
4. Wait ~2 minutes for provisioning

From **Project Settings → API**, copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3 — Run Database Migrations

In the Supabase dashboard → **SQL Editor**, run each file **in order**:

1. Copy and paste `supabase/migrations/0001_initial_schema.sql` → Run
2. Copy and paste `supabase/migrations/0002_rls_policies.sql` → Run
3. Copy and paste `supabase/migrations/0003_functions.sql` → Run
4. Copy and paste `supabase/migrations/0004_realtime.sql` → Run

### Enable the Auth Hook (required)

After running migrations, go to:

**Authentication → Hooks → Add hook**

| Field | Value |
|---|---|
| Hook type | `custom_access_token` |
| Schema | `public` |
| Function | `custom_access_token_hook` |

> **Why:** This hook injects `org_id` into the JWT on every login, which is how RLS policies identify which tenant's data to expose. Without this, all data queries will return empty.

---

## Step 4 — Configure Environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in at minimum:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_APP_URL=http://localhost:3000   # change to your domain when deploying

# Generate these with: openssl rand -hex 32
INTEGRATION_STATE_SECRET=<32-char random string>
SYNC_CRON_SECRET=<32-char random string>
```

Leave the Google/Mailchimp/Calendly keys blank for now — you can add them when setting up integrations.

---

## Step 5 — Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll be redirected to `/register`. Create your workspace — this creates your organization, your profile (as owner), and the default pipeline stages (Lead → Qualified → Proposal → Won → Lost).

---

## Step 6 — VPS Deployment

### 6a. Server prep

```bash
# On your VPS (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
npm install -g pm2
```

### 6b. Clone and build

```bash
git clone https://github.com/yourusername/minicrm.git /var/www/minicrm
cd /var/www/minicrm
npm install
cp .env.example .env.local
# Edit .env.local with production values (NEXT_PUBLIC_APP_URL = https://crm.yourdomain.com)
npm run build
```

### 6c. Start with PM2

```bash
pm2 start npm --name "minicrm" -- start
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot
```

### 6d. nginx reverse proxy

Create `/etc/nginx/sites-available/minicrm`:

```nginx
server {
    listen 80;
    server_name crm.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/crm.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/minicrm /etc/nginx/sites-enabled/
certbot --nginx -d crm.yourdomain.com
nginx -t && systemctl reload nginx
```

---

## Step 7 — Set Up Sync Cron Jobs (Optional)

Add to your VPS crontab (`crontab -e`):

```cron
# Gmail sync every 15 minutes
*/15 * * * * curl -s -X POST https://crm.yourdomain.com/api/integrations/google/gmail/sync \
  -H "Authorization: Bearer YOUR_SYNC_CRON_SECRET"

# Calendly sync every hour
0 * * * * curl -s -X POST https://crm.yourdomain.com/api/integrations/calendly/sync \
  -H "Authorization: Bearer YOUR_SYNC_CRON_SECRET"
```

Replace `YOUR_SYNC_CRON_SECRET` with the value you set in `.env.local`.

---

## Quick-reference: Build Command

The `npm run build` and `npm run dev` scripts call Node directly (the `.bin/next` symlink is broken in this install):

```bash
# These all work correctly via package.json scripts:
npm run dev     # development server
npm run build   # production build
npm run start   # serve production build
```

If you ever call Next.js directly, use:
```bash
node node_modules/next/dist/bin/next build --turbopack
```
