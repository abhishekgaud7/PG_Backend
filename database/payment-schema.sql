-- Payment Schema Migration for Bookings Table
-- Run this in your Supabase SQL Editor to add payment support

-- Add payment-related columns to bookings table
ALTER TABLE bookings
ADD COLUMN payment_type VARCHAR(20) CHECK (payment_type IN ('Mock', 'Cash')),
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('success', 'pending', 'failed')),
ADD COLUMN payment_id VARCHAR(255),
ADD COLUMN total_amount INTEGER CHECK (total_amount >= 0);

-- Add index for payment queries
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_payment_type ON bookings(payment_type);

-- Add comment for documentation
COMMENT ON COLUMN bookings.payment_type IS 'Type of payment: Mock (test payment) or Cash (pay on location)';
COMMENT ON COLUMN bookings.payment_status IS 'Payment status: success, pending, or failed';
COMMENT ON COLUMN bookings.payment_id IS 'Payment transaction ID (MOCK_PAY_* or CASH_*)';
COMMENT ON COLUMN bookings.total_amount IS 'Total booking amount in rupees';
