# Supabase Setup Guide - StayEasy Backend

Complete guide to set up your FREE Supabase database and get all environment variables.

---

## Step 1: Create Supabase Account (2 minutes)

1. Go to [Supabase](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. **No credit card required** ✅

---

## Step 2: Create New Project (3 minutes)

1. Click **"New Project"**
2. Fill in project details:
   - **Name**: `stayeasy` (or your choice)
   - **Database Password**: Generate strong password → **COPY IT!**
   - **Region**: Choose closest to you (e.g., Mumbai for India)
   - **Pricing Plan**: **FREE** (selected by default)

3. Click **"Create new project"**
4. Wait 2-3 minutes for setup to complete

---

## Step 3: Get Environment Variables (1 minute)

### A. Get SUPABASE_URL

1. In your project dashboard
2. Go to **Settings** (⚙️ icon in sidebar)
3. Click **"API"**
4. Find **"Project URL"**
5. Copy the URL (looks like: `https://xxxxxxxxxxxxx.supabase.co`)

**Example:**
```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
```

### B. Get SUPABASE_ANON_KEY

1. Same page (**Settings → API**)
2. Find **"Project API keys"** section
3. Copy **"anon public"** key
4. This is a long string starting with `eyJh...`

**Example:**
```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### C. Get SUPABASE_SERVICE_KEY

1. Same page (**Settings → API**)
2. Find **"service_role secret"** key
3. Click **"Reveal"** (⚠️ Keep this secret!)
4. Copy the key

**Example:**
```
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!WARNING]
> **NEVER commit service_role key to Git!**
> This key has admin access. Keep it in `.env` only.

---

## Step 4: Run SQL Schema (3 minutes)

### A. Open SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**

### B. Copy and Run Schema

1. Open `database/schema.sql` from your project
2. Copy ALL the SQL code
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl/Cmd + Enter)

You should see: ✅ **"Success. No rows returned"**

### C. Verify Tables Created

1. Click **"Table Editor"** (left sidebar)
2. You should see 3 tables:
   - ✅ `users`
   - ✅ `properties`
   - ✅ `bookings`

---

## Step 5: Update .env File (1 minute)

Edit `/home/harshu8685/Projects/PG-Backend/.env`:

```env
PORT=5000

# Supabase Configuration
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-ANON-KEY
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-SERVICE-KEY

# JWT Secret (for custom authentication)
JWT_SECRET=802c01fe6ea55960542e45df44d974fc55152e24815e9e0e06d7c27ac21e730e

NODE_ENV=development
```

**Replace:**
- `YOUR-PROJECT-ID` with your actual project ID
- `YOUR-ANON-KEY` with your anon key
- `YOUR-SERVICE-KEY` with your service role key

---

## Step 6: Test the Server (1 minute)

```bash
cd /home/harshu8685/Projects/PG-Backend
npm run dev
```

**Expected output:**
```
Server is running on port 5000 in development mode
Database: Supabase PostgreSQL
```

**Test health check:**
```bash
curl http://localhost:5000/
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

## Quick Reference Card

Copy this for your notes:

```
Project Name: stayeasy
Dashboard: https://supabase.com/dashboard/project/YOUR-PROJECT-ID

SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_ANON_KEY=eyJh... (copy from dashboard)
SUPABASE_SERVICE_KEY=eyJh... (copy from dashboard)

SQL Editor: Dashboard → SQL Editor
Table Viewer: Dashboard → Table Editor
Logs: Dashboard → Logs
```

---

## Environment Variables Summary

| Variable | Where to Get | Example |
|----------|--------------|---------|
| `PORT` | Your choice | `5000` |
| `SUPABASE_URL` | Settings → API → Project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Settings → API → anon public | `eyJhbGc...` (long string) |
| `SUPABASE_SERVICE_KEY` | Settings → API → service_role | `eyJhbGc...` (long string) |
| `JWT_SECRET` | Already generated | `802c01fe...` (from setup) |
| `NODE_ENV` | development/production | `development` |

---

## Troubleshooting

### "Invalid API key"
- Check SUPABASE_URL is correct (no trailing slash)
- Verify SUPABASE_SERVICE_KEY is copied fully
- Make sure `.env` file is in project root

### "relation 'users' does not exist"
- Run SQL schema in Supabase SQL Editor
- Verify tables created in Table Editor

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Server won't start
- Check all 3 Supabase env vars are set
- Restart terminal after updating .env
- Run `npm install` again

---

## Supabase Free Tier Limits

✅ **What's FREE:**
- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- 500,000 Edge Function invocations
- Unlimited API requests

**More than enough for StayEasy!** 🎉

---

## Next Steps

1. ✅ Supabase project created
2. ✅ Environment variables obtained
3. ✅ SQL schema run
4. ✅ Server tested locally
5. 🚀 Ready to test API endpoints!

See [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) for deploying to production.

---

## Useful Supabase Links

- Dashboard: https://supabase.com/dashboard
- Documentation: https://supabase.com/docs
- SQL Reference: https://supabase.com/docs/guides/database
- API Docs: https://supabase.com/docs/reference/javascript

---

**Setup Time:** ~10 minutes total

Happy coding! 🚀
