# Deployment Guide - StayEasy Backend

This guide walks you through deploying the StayEasy backend to production.

---

## Prerequisites

- [x] GitHub account
- [x] MongoDB Atlas account (free tier)
- [x] Render or Railway account (free tier)
- [x] All code tested locally

---

## Part 1: MongoDB Atlas Setup

### Step 1: Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create account
3. Click **"Build a Database"**
4. Select **FREE** tier (M0 Sandbox)
5. Choose cloud provider & region (closest to your users)
6. Name your cluster (e.g., `stayeasy-cluster`)
7. Click **"Create Cluster"**

### Step 2: Create Database User

1. In Security → Database Access
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `stayeasy_admin` (or your choice)
5. Password: Generate secure password (save it!)
6. User Privileges: **Read and write to any database**
7. Click **"Add User"**

### Step 3: Configure Network Access

1. In Security → Network Access
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add specific IPs for better security
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Driver: Node.js, Version: 5.5 or later
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your credentials
6. Add database name: `stayeasy`
   ```
   mongodb+srv://stayeasy_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/stayeasy?retryWrites=true&w=majority
   ```

---

## Part 2: Deploy to Render

### Step 1: Push to GitHub

```bash
cd /home/harshu8685/Projects/PG-Backend

# Add all files
git add .

# Commit
git commit -m "Complete StayEasy backend implementation"

# Push to GitHub
git push origin main
```

### Step 2: Create Render Account

1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your `PG-Backend` repository
3. Configure:
   - **Name**: `stayeasy-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: (leave blank)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb+srv://stayeasy_admin:YOUR_PASSWORD@...` |
| `JWT_SECRET` | `your_production_secret_min_32_chars_random` |
| `NODE_ENV` | `production` |

**Important**: Generate a strong JWT_SECRET (32+ characters, random)

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Render will show build logs
4. Once deployed, you'll get a URL: `https://stayeasy-backend.onrender.com`

### Step 6: Test Production API

```bash
curl https://stayeasy-backend.onrender.com/

# Should return:
# {
#   "success": true,
#   "message": "StayEasy API is running",
#   "version": "1.0.0"
# }
```

---

## Part 3: Alternative - Deploy to Railway

### Step 1: Create Railway Account

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose `PG-Backend` repository

### Step 3: Add Environment Variables

1. Click on your service
2. Go to **"Variables"** tab
3. Add:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_secret
   NODE_ENV=production
   ```

### Step 4: Configure Settings

1. Go to **"Settings"** tab
2. **Start Command**: `npm start`
3. **Health Check Path**: `/`

### Step 5: Deploy

1. Railway auto-deploys on push
2. Get your URL from **"Settings"** → **"Domains"**
3. Click **"Generate Domain"**

---

## Part 4: Post-Deployment

### Verify Deployment

✅ **Health Check**
```bash
curl https://your-app.onrender.com/
```

✅ **Register User**
```bash
curl -X POST https://your-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123",
    "role": "owner"
  }'
```

✅ **Create Property**
```bash
curl -X POST https://your-app.onrender.com/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test PG",
    "type": "PG",
    "city": "Mandi",
    "address": "123 Test St",
    "pricePerMonth": 5000,
    "availableBeds": 3,
    "gender": "Any"
  }'
```

### Update Frontend

In your frontend `.env` file:
```env
VITE_API_URL=https://stayeasy-backend.onrender.com/api
# or
REACT_APP_API_URL=https://stayeasy-backend.onrender.com/api
```

### Enable CORS for Production

If you need to restrict CORS to your frontend domain, update `server.js`:

```javascript
// Replace
app.use(cors());

// With
app.use(cors({
  origin: 'https://your-frontend.vercel.app',
  credentials: true
}));
```

---

## Monitoring & Maintenance

### Render Dashboard

- View logs: **"Logs"** tab
- Monitor usage: **"Metrics"** tab
- Redeploy: **"Manual Deploy"** → **"Deploy latest commit"**

### MongoDB Atlas Dashboard

- Monitor connections: **"Metrics"** tab
- View data: **"Browse Collections"**
- Backup: **"Backup"** (paid feature)

### Common Issues

**Issue**: App sleeps after inactivity (Render free tier)
- **Solution**: Use UptimeRobot to ping every 5 minutes
- Or upgrade to paid tier

**Issue**: MongoDB connection timeout
- **Solution**: Check network access in Atlas
- Verify connection string

**Issue**: 500 errors after deployment
- **Solution**: Check logs in Render dashboard
- Verify environment variables

---

## Security Best Practices

### ✅ Implemented

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- Error handling without sensitive data

### 🔒 Production Recommendations

1. **Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```

2. **Helmet.js** (Security headers)
   ```bash
   npm install helmet
   ```

3. **MongoDB Indexes** (Already added)
   - City, type, gender indexed

4. **Environment Variables**
   - Never commit `.env` to Git
   - Use strong JWT secret (32+ chars)

5. **HTTPS Only**
   - Render provides HTTPS by default

---

## API Documentation URL

Share this with your frontend team:
```
https://stayeasy-backend.onrender.com/
```

Base API URL for frontend:
```
https://stayeasy-backend.onrender.com/api
```

---

## Rollback Procedure

If something goes wrong:

### On Render:
1. Go to **"Events"** tab
2. Click **"Rollback"** on previous successful deploy

### On Railway:
1. Go to **"Deployments"** tab
2. Click **"Restore"** on previous version

### Manual:
```bash
git revert HEAD
git push origin main
```

---

## Next Steps After Deployment

1. ✅ Test all endpoints in production
2. ✅ Share API URL with frontend team
3. 🎨 Connect React frontend
4. 📊 Monitor logs for errors
5. 🚀 Add features (images, payments, etc.)

---

## Support

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

Congratulations! Your StayEasy backend is now live! 🎉
