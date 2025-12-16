-- Migration Script: Soft Delete Pattern + New Fields
-- Run this in your Supabase SQL Editor
-- This script is idempotent (safe to run multiple times)

-- ============================================
-- USERS TABLE UPDATES
-- ============================================

-- Add soft delete columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted) WHERE is_deleted = false;

-- ============================================
-- PROPERTIES TABLE UPDATES
-- ============================================

-- Add soft delete columns
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add new property fields
ALTER TABLE properties ADD COLUMN IF NOT EXISTS area VARCHAR(100);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS electricity_charges INTEGER DEFAULT 0 CHECK (electricity_charges >= 0);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS house_rules TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create indexes for soft delete and new fields
CREATE INDEX IF NOT EXISTS idx_properties_is_deleted ON properties(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_pincode ON properties(pincode);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);

-- ============================================
-- BOOKINGS TABLE UPDATES
-- ============================================

-- Add soft delete columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add new booking fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS govt_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS emergency_name VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount INTEGER;

-- Update status constraint to include new values
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed'));

-- Add payment type constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_type_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_type_check 
  CHECK (payment_type IN ('Mock', 'Cash') OR payment_type IS NULL);

-- Add payment status constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check 
  CHECK (payment_status IN ('pending', 'success', 'failed') OR payment_status IS NULL);

-- Create indexes for soft delete and new fields
CREATE INDEX IF NOT EXISTS idx_bookings_is_deleted ON bookings(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_type ON bookings(payment_type);

-- ============================================
-- HELPER FUNCTIONS FOR SOFT DELETE
-- ============================================

-- Function to soft delete a property
CREATE OR REPLACE FUNCTION soft_delete_property(property_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE properties 
  SET is_deleted = TRUE, deleted_at = NOW()
  WHERE id = property_uuid AND is_deleted = FALSE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a soft-deleted property
CREATE OR REPLACE FUNCTION restore_property(property_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE properties 
  SET is_deleted = FALSE, deleted_at = NULL
  WHERE id = property_uuid AND is_deleted = TRUE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to soft delete a booking
CREATE OR REPLACE FUNCTION soft_delete_booking(booking_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bookings 
  SET is_deleted = TRUE, deleted_at = NOW()
  WHERE id = booking_uuid AND is_deleted = FALSE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a soft-deleted booking
CREATE OR REPLACE FUNCTION restore_booking(booking_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bookings 
  SET is_deleted = FALSE, deleted_at = NULL
  WHERE id = booking_uuid AND is_deleted = TRUE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify migration success:

-- Check users table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- ORDER BY ordinal_position;

-- Check properties table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'properties' 
-- ORDER BY ordinal_position;

-- Check bookings table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'bookings' 
-- ORDER BY ordinal_position;

-- Check all indexes
-- SELECT tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('users', 'properties', 'bookings')
-- ORDER BY tablename, indexname;

COMMENT ON COLUMN users.is_deleted IS 'Soft delete flag - true means user account is deleted but data preserved';
COMMENT ON COLUMN properties.is_deleted IS 'Soft delete flag - true means property is deleted but data preserved';
COMMENT ON COLUMN bookings.is_deleted IS 'Soft delete flag - true means booking is cancelled/deleted but data preserved';

-- Migration completed successfully!
