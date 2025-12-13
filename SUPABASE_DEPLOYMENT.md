# Deployment Guide - StayEasy Backend with Supabase

Deploy your StayEasy backend to production using Supabase + Render/Railway.

---

## Overview

**Architecture:**
- **Database**: Supabase (PostgreSQL) - Already cloud-hosted ✅
- **Backend API**: Render or Railway (Node.js)
- **Total Cost**: $0 (100% FREE!) 🎉

---

## Part 1: Supabase Production Setup

### Step 1: Secure Your Database

1. Go to Supabase Dashboard → **Settings** → **API**
2. Under **"Service role key"**, click **"Reveal"**
3. **IMPORTANT**: Never expose this in frontend or commit to Git!

### Step 2: Configure for Production

#### A. Enable RLS Policies (Already Done via SQL)

✅ Row Level Security is already configured in your schema
✅ Service role bypasses RLS for backend operations

#### B. Add Production Environment

Keep separate Supabase projects for development vs production (optional):

**Development:**
- Project: `stayeasy-dev`
- Used for local testing

**Production:**
- Project: `stayeasy-prod`
- Used for deployed app

Or use same project for both (simpler for small projects).

---

## Part 2: Deploy to Render

### Prerequisites

- GitHub account
- Code pushed to GitHub repository

### Step 1: Push to GitHub

```bash
cd /home/harshu8685/Projects/PG-Backend

# Add all files
git add .

# Commit
git commit -m "Supabase migration complete"

# Push
git push origin main
```

### Step 2: Create Render Account

1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Authorize Render

### Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect `PG-Backend` repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `stayeasy-api` |
| **Region** | Singapore / Oregon (closest to users) |
| **Branch** | `main` |
| **Root Directory** | (leave blank) |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

| Key | Value | Where to Get |
|-----|-------|--------------|
| `PORT` | `5000` | Fixed value |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | `eyJh...` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_KEY` | `eyJh...` | Supabase → Settings → API → service_role |
| `JWT_SECRET` | `802c01fe6ea...` | From your `.env` file |
| `NODE_ENV` | `production` | Fixed value |

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build
3. Render assigns URL: `https://stayeasy-api.onrender.com`

### Step 6: Verify Deployment

```bash
curl https://stayeasy-api.onrender.com/
```

**Expected response:**
```json
{
  "success": true,
  "message": "StayEasy API is running with Supabase",
  "version": "2.0.0",
  "database": "Supabase PostgreSQL"
}
```

---

## Part 3: Alternative - Deploy to Railway

### Step 1: Create Railway Account

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose `PG-Backend`

### Step 3: Add Environment Variables

1. Click on your service
2. Go to **"Variables"** tab
3. Click **"RAW Editor"**
4. Paste:

```env
PORT=5000
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=802c01fe6ea55960542e45df44d974fc55152e24815e9e0e06d7c27ac21e730e
NODE_ENV=production
```

### Step 4: Configure Settings

1. Go to **"Settings"** tab
2. **Start Command**: `npm start`
3. **Health Check Path**: `/`

### Step 5: Get Your URL

1. **"Settings"** → **"Domains"**
2. Click **"Generate Domain"**
3. Railway provides: `https://pg-backend-production-xxxx.up.railway.app`

---

## Part 4: Post-Deployment Setup

### 1. Test All Endpoints

**Register User:**
```bash
curl -X POST https://your-api-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Owner",
    "email": "owner@test.com",
    "phone": "1234567890",
    "password": "password123",
    "role": "owner"
  }'
```

**Login:**
```bash
curl -X POST https://your-api-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@test.com",
    "password": "password123"
  }'
```

**Create Property:** (use token from login)
```bash
curl -X POST https://your-api-url/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Cozy PG Near Campus",
    "type": "PG",
    "city": "Mandi",
    "address": "123 College Road",
    "pricePerMonth": 7000,
    "availableBeds": 4,
    "gender": "Any",
    "amenities": ["WiFi", "Food", "Laundry"]
  }'
```

**Get Properties:**
```bash
curl https://your-api-url/api/properties?city=Mandi
```

### 2. Update Frontend

In your frontend `.env`:

**For Vite:**
```env
VITE_API_URL=https://stayeasy-api.onrender.com/api
```

**For Create React App:**
```env
REACT_APP_API_URL=https://stayeasy-api.onrender.com/api
```

### 3. Configure CORS (if needed)

If your frontend is on a specific domain, update `server.js`:

```javascript
// Replace
app.use(cors());

// With
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));
```

---

## Part 5: Monitoring & Maintenance

### Render Dashboard

**View Logs:**
1. Dashboard → Your service
2. Click **"Logs"** tab
3. See real-time server logs

**Monitor Usage:**
1. **"Metrics"** tab
2. View CPU, memory, requests

**Redeploy:**
1. **"Manual Deploy"**
2. **"Deploy latest commit"**

### Supabase Dashboard

**Monitor Database:**
1. Dashboard → **"Database"**
2. View disk usage, connections

**View Data:**
1. **"Table Editor"**
2. Browse users, properties, bookings

**Check Logs:**
1. **"Logs"** → **"Postgres Logs"**
2. See query performance

**Backups (Paid Feature):**
- Free tier: No automatic backups
- Manual: Use `pg_dump` or upgrade to Pro

---

## Part 6: Security Checklist

### ✅ Before Going Live

- [ ] JWT_SECRET is strong and random (32+ characters)
- [ ] SUPABASE_SERVICE_KEY is secret (not in frontend)
- [ ] NODE_ENV set to `production`
- [ ] CORS configured for your frontend domain
- [ ] RLS policies enabled on Supabase tables
- [ ] .env file in .gitignore
- [ ] Test all protected routes
- [ ] Verify unauthorized access fails

### 🔒 Additional Security

**1. Rate Limiting** (Optional but recommended)

```bash
npm install express-rate-limit
```

Update `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**2. Helmet.js** (Security headers)

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## Part 7: Domain Setup (Optional)

### Custom Domain with Render

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Render dashboard → **"Settings"** → **"Custom Domains"**
3. Add your domain: `api.stayeasy.com`
4. Add CNAME record in your DNS:
   - Name: `api`
   - Value: `stayeasy-api.onrender.com`

**SSL/HTTPS:** Render provides free SSL automatically! ✅

---

## Part 8: CI/CD (Continuous Deployment)

### Auto-Deploy on Git Push

**Render:**
- Already enabled by default
- Push to `main` branch = auto-deploy

**Railway:**
- Also auto-deploys on push

### Deployment Workflow

```bash
# Make changes locally
git add .
git commit -m "Add feature"
git push origin main

# Wait 2-3 minutes
# New version deployed automatically! 🚀
```

---

## Part 9: Troubleshooting

### Issue: "Invalid API key" in production

**Solution:**
- Check SUPABASE_SERVICE_KEY is set correctly
- Go to Render/ Railway → Environment Variables
- Verify no extra spaces in the key

### Issue: 500 errors after deployment

**Solution:**
1. Check Render logs: Dashboard → Logs
2. Common causes:
   - Missing environment variables
   - Wrong Supabase keys
   - SQL schema not run

### Issue: CORS errors from frontend

**Solution:**
Update `server.js` with your frontend URL:
```javascript
app.use(cors({
  origin: 'https://your-frontend.vercel.app'
}));
```

### Issue: App "sleeps" on Render free tier

**Behavior:** Cold start after 15 min inactivity

**Solutions:**
1. Use UptimeRobot to ping every 14 minutes
2. Upgrade to Render paid tier ($7/month)
3. Accept 10-20s cold start delay

---

## Part 10: Scaling (Future)

### When to Upgrade

**Supabase:**
- Free: 500 MB database (1000s of properties)
- Pro: $25/month (8 GB, daily backups)

**Render:**
- Free: Good for 100s concurrent users
- Starter: $7/month (faster, no sleep)

### Performance Optimization

1. **Database Indexes** (already done in schema.sql)
2. **Connection Pooling** (Supabase handles this)
3. **Caching** (add Redis if needed)
4. **CDN** (for images)

---

## Cost Breakdown

| Service | Tier | Cost | Limits |
|---------|------|------|--------|
| **Supabase** | Free | $0 | 500 MB, 50K users |
| **Render** | Free | $0 | 750 hrs/month |
| **Total** | - | **$0/month** | ✅ |

**For production at scale:**
- Supabase Pro: $25/month
- Render Starter: $7/month
- **Total: $32/month**

---

## Deployment Checklist

- [ ] Supabase project created
- [ ] SQL schema run in Supabase
- [ ] Code pushed to GitHub
- [ ] Render/Railway account created
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health check passes
- [ ] Test all endpoints
- [ ] Frontend connected
- [ ] CORS configured
- [ ] Monitoring set up

---

## API URLs for Production

Share these with your frontend team:

```
Base URL: https://stayeasy-api.onrender.com/api

Endpoints:
POST   /auth/register
POST   /auth/login
GET    /properties
GET    /properties/:id
POST   /properties      (owner, authenticated)
PUT    /properties/:id  (owner, authenticated)
DELETE /properties/:id  (owner, authenticated)
POST   /bookings        (authenticated)
GET    /bookings/my     (authenticated)
GET    /bookings/property/:id (owner, authenticated)
PUT    /bookings/:id    (owner, authenticated)
```

---

## Resources

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Express.js**: https://expressjs.com

---

## Rollback Procedure

If deployment fails:

**On Render:**
1. Dashboard → Events
2. Click "Rollback" on previous deploy

**On Railway:**
1. Deployments tab
2. Click "Restore" on previous version

**Manual:**
```bash
git revert HEAD
git push origin main
```

---

## Next Steps

1. ✅ Backend deployed to production
2. 🎨 Deploy frontend (Vercel/Netlify)
3. 🔗 Connect frontend to backend API
4. 📊 Monitor usage and errors
5. 🚀 Launch to users!

---

**Total Deployment Time:** 15-20 minutes

Congratulations! Your StayEasy backend is now live! 🎉
