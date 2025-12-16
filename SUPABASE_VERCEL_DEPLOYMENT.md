# Supabase Backend Deployment Guide

## Overview
This backend is ready to deploy to Vercel and integrate with your frontend at https://pg-frontend-ecru.vercel.app

## Database Setup

### Step 1: Run Migration Scripts in Supabase SQL Editor

Run these scripts in order:

1. **Base Schema** (`database/schema.sql`)
   - Creates users, properties, bookings tables
   - Sets up triggers and indexes

2. **Soft Delete Migration** (`database/migration-soft-delete.sql`)
   - Adds soft delete columns (`is_deleted`, `deleted_at`)
   - Adds new fields (area, pincode, electricity_charges, etc.)
   - Adds emergency contact fields to bookings
   - Creates helper functions

3. **RLS Policies** (`database/rls-policies.sql`)
   - Enables Row Level Security
   - Creates policies for properties, bookings, users
   - Adds payment_status field

### Step 2: Verify Database Setup

Run these queries in Supabase SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'properties', 'bookings');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'properties', 'bookings');

-- Check soft delete columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name IN ('is_deleted', 'deleted_at');
```

## Vercel Deployment

### Step 1: Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### Step 2: Set Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

```env
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret-key
NODE_ENV=production
PORT=5000
```

**Where to find Supabase keys:**
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy:
   - Project URL → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_KEY`

### Step 3: Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Properties (Public)
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get single property

### Properties (Owner Only)
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Soft delete property
- `PATCH /api/properties/:id/restore` - Restore deleted property

### Bookings (User)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get user's bookings
- `DELETE /api/bookings/:id` - Cancel booking (soft delete)

### Bookings (Owner)
- `GET /api/bookings/owner` - Get all bookings for owner's properties
- `GET /api/bookings/property/:propertyId` - Get bookings for specific property
- `PATCH /api/bookings/:id` - Update booking status
- `PATCH /api/bookings/:id/payment` - Update payment status
- `PATCH /api/bookings/:id/restore` - Restore cancelled booking

## Frontend Integration

Your frontend at https://pg-frontend-ecru.vercel.app should use these endpoints.

### Example API Calls

```javascript
// Set your backend URL
const API_URL = 'https://your-backend.vercel.app';

// Get properties
const response = await fetch(`${API_URL}/api/properties`);
const data = await response.json();

// Create booking (with auth token)
const response = await fetch(`${API_URL}/api/bookings`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    property: propertyId,
    checkInDate: '2025-01-01',
    checkOutDate: '2025-01-31',
    govtId: 'AADHAAR123',
    emergencyName: 'John Doe',
    emergencyPhone: '+919876543210',
    paymentInfo: {
      type: 'Mock',
      status: 'success',
      id: 'mock_payment_123'
    }
  })
});
```

## Key Features

### ✅ Soft Delete Pattern
- No data is ever permanently deleted from Supabase
- All DELETE operations mark records as `is_deleted = true`
- Data preserved for audit trails and recovery
- Owners can restore deleted properties and bookings

### ✅ Enhanced Payment Tracking
- `payment_type`: 'Mock' or 'Cash'
- `payment_status`: 'paid' or 'unpaid'
- `payment_id`: Transaction reference
- `total_amount`: Calculated booking amount

### ✅ Row Level Security (RLS)
- Properties: Public read, owner-only write
- Bookings: User and property owner can view
- Users: Self-access only
- Service role bypass for backend operations

### ✅ Emergency Contacts
- `govt_id`: Government ID for verification
- `emergency_name`: Emergency contact name
- `emergency_phone`: Emergency contact number

### ✅ Location Features
- `latitude`, `longitude`: GPS coordinates
- `area`: Locality/area name
- `pincode`: Postal code
- `city`: City name

## Testing

### Test Health Endpoint

```bash
curl https://your-backend.vercel.app/
```

Expected response:
```json
{
  "success": true,
  "message": "StayEasy API is running with Supabase",
  "version": "2.0.0",
  "database": "Supabase PostgreSQL"
}
```

### Test Authentication

```bash
# Register
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"+919876543210","password":"Test@123","role":"user"}'

# Login
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'
```

### Test Properties

```bash
# Get all properties
curl https://your-backend.vercel.app/api/properties

# Get properties by city
curl https://your-backend.vercel.app/api/properties?city=Mumbai
```

## Troubleshooting

### Issue: 500 Error on Vercel
**Solution:** Check environment variables are set correctly in Vercel dashboard

### Issue: Database connection fails
**Solution:** Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct

### Issue: RLS policies blocking requests
**Solution:** Ensure you're using `SUPABASE_SERVICE_KEY` (not anon key) in backend

### Issue: CORS errors
**Solution:** Backend has CORS enabled for all origins. Check frontend is making requests to correct URL.

## Monitoring

### Vercel Logs
```bash
vercel logs your-deployment-url
```

### Supabase Logs
Go to Supabase Dashboard → Logs → API Logs

## Next Steps

1. ✅ Run all migration scripts in Supabase
2. ✅ Deploy backend to Vercel
3. ✅ Set environment variables
4. ✅ Test all endpoints
5. ✅ Update frontend API URL
6. ✅ Test full integration

## Support

For issues, check:
- Vercel deployment logs
- Supabase API logs
- Browser console for frontend errors
- Network tab for API requests/responses

---

**Backend Status:** ✅ Ready for Production
**Database:** ✅ Supabase PostgreSQL with RLS
**Deployment:** ✅ Vercel Serverless
**Frontend:** https://pg-frontend-ecru.vercel.app
