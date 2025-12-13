# StayEasy Backend API

StayEasy is a RESTful API for a PG & Guest House booking platform built with Node.js, Express, and **Supabase (PostgreSQL)**.

## ✨ Features

- **User Authentication**: JWT-based authentication with role-based access control (user/owner/admin)
- **Property Management**: CRUD operations for PG/Guest House listings with search and filter capabilities
- **Booking System**: Create and manage booking requests with status tracking
- **Supabase Integration**: PostgreSQL database with real-time capabilities
- **Security**: Password hashing with bcrypt, protected routes, and input validation
- **Error Handling**: Centralized error handling with descriptive messages

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv

## 📋 Prerequisites

- Node.js (v14 or higher)
- Supabase account (free)
- npm or yarn

## 🏁 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/meeharshu8685-dot/PG-Backend.git
cd PG-Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

Follow the complete guide: **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

**Quick steps:**
1. Create free account at [Supabase](https://supabase.com)
2. Create new project
3. Copy Project URL and API keys
4. Run SQL schema from `database/schema.sql`

### 4. Environment Setup

Create `.env` file:

```env
PORT=5000

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# JWT Secret  
JWT_SECRET=802c01fe6ea55960542e45df44d974fc55152e24815e9e0e06d7c27ac21e730e

NODE_ENV=development
```

📖 **See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions**

### 5. Run the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

---

## Authentication Routes

### Register User/Owner
**POST** `/api/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

---

### Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## Property Routes

### Get All Properties
**GET** `/api/properties`

**Query Parameters (all optional):**
- `city` - Filter by city (case-insensitive)
- `type` - Filter by type (PG/Guest House)
- `gender` - Filter by gender (Any/Male/Female)
- `minPrice` - Minimum price per month
- `maxPrice` - Maximum price per month

**Example:**
```
GET /api/properties?city=Mandi&type=PG&minPrice=5000&maxPrice=15000
```

---

### Create Property
**POST** `/api/properties`

**Authentication Required**: Bearer token in Authorization header  
**Role Required**: owner

**Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**Body:**
```json
{
  "title": "Comfortable PG near College",
  "type": "PG",
  "gender": "Any",
  "address": "123 Main Street",
  "city": "Mandi",
  "pricePerMonth": 8000,
  "deposit": 5000,
  "amenities": ["WiFi", "Food", "AC", "Laundry"],
  "availableBeds": 5,
  "description": "Well-maintained PG with all modern facilities"
}
```

**Note:** Field names use camelCase in API but are stored as snake_case in database (conversion handled automatically)

---

## Booking Routes

### Create Booking
**POST** `/api/bookings`

**Authentication Required**: Bearer token

**Body:**
```json
{
  "property": "property-uuid-here",
  "checkInDate": "2024-06-01",
  "checkOutDate": "2024-12-31"
}
```

---

### Get My Bookings
**GET** `/api/bookings/my`

**Authentication Required**: Bearer token

---

## 📁 Project Structure

```
PG-Backend/
├── config/
│   └── supabase.js          # Supabase client setup
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── propertyController.js # Property CRUD
│   └── bookingController.js  # Booking management
├── middleware/
│   ├── auth.js              # JWT verification & authorization
│   └── errorHandler.js      # Global error handler
├── database/
│   └── schema.sql           # PostgreSQL schema for Supabase
├── routes/
│   ├── auth.js              # Auth routes
│   ├── properties.js        # Property routes
│   └── bookings.js          # Booking routes
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── server.js                # Main application entry
├── README.md
├── SUPABASE_SETUP.md        # Supabase setup guide
└── SUPABASE_DEPLOYMENT.md   # Deployment guide
```

---

## 🗄️ Database Schema

### Users Table
- `id` (UUID, primary key)
- `name` (varchar)
- `email` (varchar, unique)
- `phone` (varchar)
- `role` (enum: user/owner/admin)
- `password_hash` (text)
- Timestamps

### Properties Table
- `id` (UUID, primary key)
- `owner_id` (UUID, foreign key → users)
- `title`, `type`, `gender` (enums)
- `address`, `city` (with indexes)
- `price_per_month`, `deposit` (integer)
- `amenities`, `images` (text arrays)
- `available_beds` (integer)
- `description` (text)
- Timestamps

### Bookings Table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users)
- `property_id` (UUID, foreign key → properties)
- `check_in_date`, `check_out_date` (date)
- `status` (enum: pending/confirmed/cancelled)
- Timestamps

---

## 🚀 Deployment

See **[SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)** for complete deployment guide.

**Quick Deploy:**
1. Push code to GitHub
2. Create account on [Render](https://render.com) or [Railway](https://railway.app)
3. Connect your repository
4. Add environment variables
5. Deploy! 🎉

---

## 🔒 Security Features

✅ **Implemented:**
- JWT token authentication (30-day expiration)
- Password hashing with bcrypt (salt rounds: 10)
- Role-based access control
- Row Level Security (RLS) in Supabase
- Input validation
- SQL injection protection (via parameterized queries)
- Protected routes middleware

---

## 🆓 Supabase Free Tier

- **Database**: 500 MB PostgreSQL
- **Storage**: 1 GB file storage
- **Bandwidth**: 2 GB
- **Users**: 50,000 monthly active users
- **API Requests**: Unlimited
- **Cost**: $0 forever!

More than enough for StayEasy! 🎯

---

## 🐛 Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📊 API Testing

Use Postman, Thunder Client, or cURL:

```bash
# Health check
curl http://localhost:5000/

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"1234567890","password":"pass123","role":"owner"}'

# Get properties
curl http://localhost:5000/api/properties?city=Mandi
```

---

## 🎯 Future Enhancements

- [ ] Image upload with Supabase Storage
- [ ] Payment integration (Razorpay/Stripe)
- [ ] Review & rating system
- [ ] Real-time chat (Socket.io or Supabase Realtime)
- [ ] Email notifications
- [ ] Admin panel
- [ ] Advanced search with geolocation

---

## 📝 License

ISC

---

## 👨‍💻 Author

StayEasy Team

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for setup help
- See [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) for deployment issues

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Database & Backend-as-a-Service
- [Express.js](https://expressjs.com) - Web framework
- [JWT](https://jwt.io) - Authentication

---

**Built with ❤️ for students and working professionals**
