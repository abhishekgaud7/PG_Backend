# Payment System Backend Implementation

## Overview

This document provides instructions for setting up and using the new payment system backend that supports both **Mock Payment** (for testing) and **Cash Payment** (pay on location) options.

## Database Migration

**IMPORTANT**: You must run this migration in your Supabase SQL Editor before using the payment features.

### Steps:
1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy the contents of `database/payment-schema.sql`
5. Paste and execute the SQL

This will add the following columns to your `bookings` table:
- `payment_type` - 'Mock' or 'Cash'
- `payment_status` - 'success', 'pending', or 'failed'
- `payment_id` - Transaction ID
- `total_amount` - Total booking amount in rupees

## API Endpoints

### 1. Mock Payment Endpoint

**POST** `/api/payments/mock-success`

Simulates a successful payment transaction for testing purposes.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": "MOCK_PAY_1734329400000_abc123xyz",
  "status": "success",
  "amount": 5000,
  "message": "Mock payment processed successfully",
  "timestamp": "2025-12-16T05:10:00.000Z"
}
```

### 2. Create Booking with Payment

**POST** `/api/bookings`

Creates a new booking with payment information.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body (Cash Payment):**
```json
{
  "property": "uuid-of-property",
  "checkInDate": "2025-12-20",
  "checkOutDate": "2025-12-25",
  "paymentInfo": {
    "type": "Cash",
    "status": "pending",
    "id": "CASH_1734329400000",
    "amount": 5000
  }
}
```

**Request Body (Mock Payment):**
```json
{
  "property": "uuid-of-property",
  "checkInDate": "2025-12-20",
  "checkOutDate": "2025-12-25",
  "paymentInfo": {
    "type": "Mock",
    "status": "success",
    "id": "MOCK_PAY_1734329400000_abc123xyz",
    "amount": 5000
  }
}
```

**Response (Cash Payment):**
```json
{
  "success": true,
  "message": "Booking created successfully. Payment due on check-in.",
  "data": {
    "id": "booking-uuid",
    "user_id": "user-uuid",
    "property_id": "property-uuid",
    "check_in_date": "2025-12-20",
    "check_out_date": "2025-12-25",
    "status": "pending",
    "payment_type": "Cash",
    "payment_status": "pending",
    "payment_id": "CASH_1734329400000",
    "total_amount": 5000,
    "created_at": "2025-12-16T05:10:00.000Z",
    "user": { "name": "...", "email": "...", "phone": "..." },
    "property": { "title": "...", "type": "...", "city": "...", "price_per_month": 3000 }
  }
}
```

**Response (Mock Payment):**
```json
{
  "success": true,
  "message": "Booking confirmed! Payment successful.",
  "data": {
    "id": "booking-uuid",
    "status": "confirmed",
    "payment_type": "Mock",
    "payment_status": "success",
    ...
  }
}
```

## Payment Flow

### Mock Payment Flow (Frontend Implementation)
1. User selects "Pay Online (Mock Payment)" option
2. Frontend calls `/api/payments/mock-success` with amount
3. Backend returns mock payment ID and success status
4. Frontend calls `/api/bookings` with payment info from step 2
5. Backend creates booking with status='confirmed'
6. User sees "Payment Successful! Booking confirmed."

### Cash Payment Flow (Frontend Implementation)
1. User selects "Pay on Location (Cash)" option
2. Frontend generates cash payment ID: `CASH_${Date.now()}`
3. Frontend calls `/api/bookings` with cash payment info
4. Backend creates booking with status='pending'
5. User sees "Booking created! Payment due on check-in."

## Validation Rules

### Payment Type Validation
- Must be either "Mock" or "Cash"
- Case-sensitive

### Payment Status Validation
- **Cash payments**: status must be "pending"
- **Mock payments**: status must be "success"

### Booking Status Logic
- **Mock payment with success status**: Booking status = 'confirmed'
- **Cash payment with pending status**: Booking status = 'pending'
- **All other cases**: Booking status = 'pending'

## Amount Calculation

If `paymentInfo.amount` is not provided, the backend automatically calculates:

```javascript
const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
const totalAmount = Math.ceil((days / 30) * property.price_per_month);
```

## Testing

### Test Mock Payment Endpoint
```bash
curl -X POST http://localhost:5000/api/payments/mock-success \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 5000}'
```

### Test Cash Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "property": "YOUR_PROPERTY_UUID",
    "checkInDate": "2025-12-20",
    "checkOutDate": "2025-12-25",
    "paymentInfo": {
      "type": "Cash",
      "status": "pending",
      "id": "CASH_1734329400000",
      "amount": 5000
    }
  }'
```

### Test Mock Payment Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "property": "YOUR_PROPERTY_UUID",
    "checkInDate": "2025-12-20",
    "checkOutDate": "2025-12-25",
    "paymentInfo": {
      "type": "Mock",
      "status": "success",
      "id": "MOCK_PAY_1734329400000",
      "amount": 5000
    }
  }'
```

## Error Handling

### Common Errors

**400 Bad Request - Missing Payment Info**
```json
{
  "success": false,
  "message": "Please provide complete payment information (type, status, id)"
}
```

**400 Bad Request - Invalid Payment Type**
```json
{
  "success": false,
  "message": "Payment type must be either \"Mock\" or \"Cash\""
}
```

**400 Bad Request - Invalid Cash Payment Status**
```json
{
  "success": false,
  "message": "Cash payment status must be \"pending\""
}
```

**400 Bad Request - Invalid Mock Payment Status**
```json
{
  "success": false,
  "message": "Mock payment status must be \"success\""
}
```

## Frontend Integration Notes

The frontend team should:

1. **Add environment variable** in `.env`:
   ```
   VITE_MOCK_PAYMENT_API_URL=/api/payments/mock-success
   ```

2. **Update PaymentModal.jsx** to:
   - Show two payment options (Mock/Cash)
   - Handle mock payment API call
   - Pass correct paymentInfo to booking API

3. **Update CheckoutManager.jsx** to:
   - Pass booking details to PaymentModal
   - Handle success/error states

## Files Modified

- ✅ `database/payment-schema.sql` - New migration file
- ✅ `controllers/paymentController.js` - New controller
- ✅ `routes/payments.js` - New routes file
- ✅ `controllers/bookingController.js` - Updated createBooking function
- ✅ `server.js` - Registered payment routes

## Next Steps

1. **Run database migration** in Supabase SQL Editor
2. **Test backend endpoints** using curl or Postman
3. **Implement frontend changes** in the separate frontend repository
4. **Test end-to-end flow** with both payment options
