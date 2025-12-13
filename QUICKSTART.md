# StayEasy Backend - Quick Start Guide

## Step 1: Configure MongoDB

Before running the server, you need to set up MongoDB Atlas:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier)
4. Click "Connect" and select "Connect your application"
5. Copy the connection string

## Step 2: Update Environment Variables

Edit the `.env` file and replace with your actual values:

```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/stayeasy?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_random_secret_key_min_32_chars
NODE_ENV=development
```

**Important**: 
- Replace `YOUR_USERNAME`, `YOUR_PASSWORD`, and `YOUR_CLUSTER` with your actual MongoDB Atlas credentials
- Change the `JWT_SECRET` to a secure random string

## Step 3: Start the Server

```bash
npm run dev
```

You should see:
```
MongoDB Connected: cluster0-xxxxx.mongodb.net
Server is running on port 5000 in development mode
```

## Step 4: Test the API

### Option A: Using cURL

**Test Health Check:**
```bash
curl http://localhost:5000/
```

**Register a User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123",
    "role": "user"
  }'
```

**Register an Owner:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Property Owner",
    "email": "owner@example.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "owner"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123"
  }'
```

Copy the token from the response and use it in the next requests.

**Create a Property (replace YOUR_TOKEN):**
```bash
curl -X POST http://localhost:5000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Comfortable PG near College",
    "type": "PG",
    "gender": "Any",
    "address": "123 Main Street, Near City Center",
    "city": "Mandi",
    "pricePerMonth": 8000,
    "deposit": 5000,
    "amenities": ["WiFi", "Food", "AC", "Laundry"],
    "availableBeds": 5,
    "description": "Well-maintained PG with all modern facilities"
  }'
```

**Get All Properties:**
```bash
curl http://localhost:5000/api/properties
```

**Search Properties by City:**
```bash
curl "http://localhost:5000/api/properties?city=Mandi"
```

**Create a Booking (replace YOUR_USER_TOKEN and PROPERTY_ID):**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "property": "PROPERTY_ID",
    "checkInDate": "2024-06-01",
    "checkOutDate": "2024-12-31"
  }'
```

**Get My Bookings:**
```bash
curl http://localhost:5000/api/bookings/my \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### Option B: Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension in VS Code
2. Create a new request collection
3. Follow the API documentation in README.md

### Option C: Using Postman

1. Open Postman
2. Import requests from the API documentation
3. Set up environment variables for token management

## Common Issues & Solutions

### Issue: "MongoServerError: bad auth"
**Solution**: Check your MongoDB credentials in `.env` file

### Issue: "connect ECONNREFUSED"
**Solution**: Make sure MongoDB Atlas allows connections from your IP (set to 0.0.0.0/0 for testing)

### Issue: "Not authorized to access this route"
**Solution**: Make sure you include the Bearer token in the Authorization header

### Issue: "User already exists"
**Solution**: Use a different email or login with existing credentials

## Next Steps

1. ✅ Test all authentication endpoints
2. ✅ Create properties as an owner
3. ✅ Create bookings as a user
4. ✅ Test search and filter functionality
5. 🚀 Deploy to Render or Railway
6. 🎨 Connect with your frontend application

## Testing Workflow Example

1. Register as owner → Get token
2. Create 2-3 properties using owner token
3. Register as user → Get token
4. Get all properties (no auth needed)
5. Create booking for a property using user token
6. Get user's bookings
7. As owner, get bookings for your property
8. Update booking status to "confirmed"

## Production Deployment Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production` in environment
- [ ] Update MongoDB connection string for production
- [ ] Configure CORS for your frontend domain
- [ ] Set up proper logging (Morgan, Winston)
- [ ] Add rate limiting
- [ ] Enable MongoDB Atlas network access for deployed server
- [ ] Test all endpoints in production environment

---

Happy coding! 🚀
