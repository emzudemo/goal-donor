# GoalGuard Deployment Guide

This guide explains how to deploy GoalGuard on your own server outside of Replit.

## Prerequisites

Before you begin, you'll need:

- A server with Node.js 18+ installed (VPS, cloud instance, or local server)
- PostgreSQL database (version 12+)
- Domain name (optional, but recommended)
- SSL certificate (Let's Encrypt recommended for production)

---

## Step 1: Export Your Code from Replit

### Option A: Download as ZIP
1. In your Replit workspace, click the three dots menu (⋮)
2. Select "Download as ZIP"
3. Extract the ZIP file on your local machine

### Option B: Use Git (Recommended)
1. In Replit, open the Shell and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Push to GitHub (or GitLab, Bitbucket):
   ```bash
   git remote add origin https://github.com/yourusername/goalguard.git
   git push -u origin main
   ```

3. Clone on your server:
   ```bash
   git clone https://github.com/yourusername/goalguard.git
   cd goalguard
   ```

---

## Step 2: Set Up PostgreSQL Database

### On Ubuntu/Debian:
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE goalguard;
CREATE USER goalguard_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE goalguard TO goalguard_user;
\q
```

### Using Managed Database (Recommended for Production):
- **Neon** (https://neon.tech) - Serverless Postgres, free tier available
- **Supabase** (https://supabase.com) - Includes auth, storage, free tier
- **AWS RDS** - Enterprise-grade, pay as you go
- **DigitalOcean Managed Databases** - Simple setup, $15/month

Get your `DATABASE_URL` in this format:
```
postgresql://username:password@host:5432/database_name
```

---

## Step 3: Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Database
DATABASE_URL=postgresql://goalguard_user:your_password@localhost:5432/goalguard
PGHOST=localhost
PGPORT=5432
PGUSER=goalguard_user
PGPASSWORD=your_secure_password
PGDATABASE=goalguard

# Session Security
SESSION_SECRET=generate_a_random_string_at_least_32_chars_long

# Strava Integration
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key

# Node Environment
NODE_ENV=production
PORT=5000
```

### How to Generate SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Important: Replit Auth Replacement

**⚠️ The current authentication uses Replit's OIDC provider, which won't work outside Replit.**

You have two options:

#### Option 1: Use a Different OAuth Provider
Replace Replit Auth with:
- **Auth0** (https://auth0.com) - Free tier, supports Google/Apple/GitHub/Email
- **Clerk** (https://clerk.dev) - Modern auth, generous free tier
- **Supabase Auth** (https://supabase.com) - Open source, free tier

#### Option 2: Implement Your Own Auth
Use Passport.js strategies for:
- Google OAuth
- GitHub OAuth
- Local username/password

*I can help you implement either option if needed.*

---

## Step 4: Install Dependencies

```bash
# Install Node.js 18+ if not installed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install project dependencies
npm install
```

---

## Step 5: Run Database Migrations

```bash
# Push schema to database
npm run db:push
```

This creates all the necessary tables (users, goals, organizations, strava_connections, sessions).

---

## Step 6: Build the Application

```bash
# Build frontend and backend for production
npm run build
```

This creates:
- `/dist/public` - Frontend static files
- `/dist/index.js` - Backend server bundle

---

## Step 7: Deploy and Run

### Option A: Run Directly with Node.js

```bash
# Start the server
NODE_ENV=production node dist/index.js
```

Server will run on port 5000 by default.

### Option B: Use PM2 (Recommended for Production)

PM2 keeps your app running, auto-restarts on crashes, and manages logs.

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start dist/index.js --name goalguard

# Save PM2 configuration
pm2 save

# Auto-start on server reboot
pm2 startup
```

Useful PM2 commands:
```bash
pm2 status           # Check app status
pm2 logs goalguard   # View logs
pm2 restart goalguard # Restart app
pm2 stop goalguard   # Stop app
```

### Option C: Use Docker (Advanced)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t goalguard .
docker run -p 5000:5000 --env-file .env goalguard
```

---

## Step 8: Set Up Reverse Proxy (Nginx)

For production, use Nginx to handle SSL and proxy requests to your Node.js app.

### Install Nginx:
```bash
sudo apt install nginx
```

### Create Nginx configuration (`/etc/nginx/sites-available/goalguard`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/goalguard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Add SSL with Let's Encrypt:
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

---

## Step 9: Configure OAuth Redirect URIs

Update your OAuth provider settings:

### Strava:
1. Go to https://www.strava.com/settings/api
2. Update "Authorization Callback Domain" to: `yourdomain.com`

### Stripe:
1. Go to Stripe Dashboard → Developers → API keys
2. No URL changes needed for API keys
3. For Stripe webhooks (if you add them later), set to: `https://yourdomain.com/api/stripe/webhook`

### Auth Provider (Auth0/Clerk/etc.):
Update callback URLs to: `https://yourdomain.com/api/auth/callback`

---

## Deployment Platform Options

### Budget-Friendly Options:

#### 1. **DigitalOcean Droplet** ($6/month)
- 1GB RAM, 25GB SSD
- Ubuntu 22.04
- Perfect for small-medium apps
- Tutorial: https://www.digitalocean.com/community/tutorials

#### 2. **Hetzner Cloud** (€4.15/month)
- 2GB RAM, 20GB SSD
- Best price/performance ratio
- EU-based servers

#### 3. **AWS Lightsail** ($5/month)
- 1GB RAM, 40GB SSD
- Easier than full AWS
- Free tier for 3 months

#### 4. **Render** (Free tier available)
- Free for web services (sleeps after inactivity)
- $7/month for always-on
- Automatic deployments from GitHub
- Built-in SSL

#### 5. **Railway** ($5/month)
- Easy deployment from GitHub
- Includes PostgreSQL
- Great developer experience

### Enterprise Options:
- **AWS EC2 + RDS** - Scalable, complex setup
- **Google Cloud Platform** - Similar to AWS
- **Azure** - Microsoft ecosystem

---

## Quick Deploy to Render (Easiest Option)

1. Push your code to GitHub
2. Sign up at https://render.com
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Environment**: Add all your environment variables
6. Click "Create Web Service"

Done! Render handles SSL, deployments, and server management automatically.

---

## Monitoring and Maintenance

### View Logs:
```bash
# PM2 logs
pm2 logs goalguard

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Backups:
```bash
# Manual backup
pg_dump -U goalguard_user goalguard > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U goalguard_user goalguard < backup_20250101.sql
```

### Automated Backups (Cron):
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump -U goalguard_user goalguard > /backups/goalguard_$(date +\%Y\%m\%d).sql
```

---

## Troubleshooting

### App won't start:
```bash
# Check if port 5000 is in use
sudo netstat -tulpn | grep 5000

# Check environment variables
printenv | grep DATABASE_URL

# Check logs
pm2 logs goalguard --lines 100
```

### Database connection errors:
```bash
# Test PostgreSQL connection
psql postgresql://user:password@host:5432/database

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### 502 Bad Gateway (Nginx):
```bash
# Check if Node app is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Security Checklist

- [ ] Use strong passwords for database
- [ ] Enable firewall (UFW on Ubuntu)
- [ ] Keep Node.js and dependencies updated
- [ ] Use SSL/HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Don't commit `.env` to Git (add to `.gitignore`)
- [ ] Regularly backup database
- [ ] Monitor server resources (RAM, CPU, disk)
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Rate limit API endpoints (add express-rate-limit)

---

## Need Help?

If you run into issues:
1. Check the logs first (`pm2 logs` or `sudo journalctl -u nginx`)
2. Verify environment variables are set correctly
3. Ensure database is accessible
4. Check firewall rules allow traffic on port 80/443

Good luck with your deployment! 🚀
