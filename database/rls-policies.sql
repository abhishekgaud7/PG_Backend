-- RLS Policies and Payment Status Migration
-- Run this in your Supabase SQL Editor AFTER running migration-soft-delete.sql

-- ============================================
-- ADD PAYMENT_STATUS FIELD TO BOOKINGS
-- ============================================

-- Add payment_status field (complements existing payment tracking)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

-- Add constraint for payment_status
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_enum_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_enum_check 
  CHECK (payment_status IN ('paid', 'unpaid'));

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status_enum ON bookings(payment_status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Note: These policies work with Supabase Auth (auth.uid())
-- If using custom JWT auth, you may need to adjust these policies

-- Enable RLS on all tables (already done in previous migration, but ensuring)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROPERTIES TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view non-deleted properties" ON properties;
DROP POLICY IF EXISTS "Owners can insert properties" ON properties;
DROP POLICY IF EXISTS "Owners can update own properties" ON properties;
DROP POLICY IF EXISTS "Owners can delete own properties" ON properties;

-- SELECT: Anyone can view non-deleted properties (public access)
CREATE POLICY "Anyone can view non-deleted properties"
  ON properties FOR SELECT
  USING (is_deleted = false);

-- INSERT: Authenticated owners only
CREATE POLICY "Owners can insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner'
  );

-- UPDATE: Owner of the property only
CREATE POLICY "Owners can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- DELETE: Owner of the property only (soft delete)
CREATE POLICY "Owners can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- ============================================
-- BOOKINGS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own bookings or property owner can view" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Property owners can update bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON bookings;

-- SELECT: User who created booking OR owner of the property
CREATE POLICY "Users can view own bookings or property owner can view"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    is_deleted = false AND (
      auth.uid() = user_id OR
      auth.uid() IN (
        SELECT owner_id FROM properties WHERE id = property_id
      )
    )
  );

-- INSERT: Authenticated users only
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Owner of the property only (for status/payment updates)
CREATE POLICY "Property owners can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT owner_id FROM properties WHERE id = property_id
    )
  );

-- DELETE: Users can delete own bookings (soft delete)
CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- SELECT: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- SERVICE ROLE BYPASS (for backend operations)
-- ============================================

-- Service role can bypass RLS for all operations
-- This is needed for backend API operations using service key

CREATE POLICY "Service role bypass for users"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass for properties"
  ON properties FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass for bookings"
  ON bookings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('users', 'properties', 'bookings');

-- Check all policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Test payment_status field
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'bookings' AND column_name = 'payment_status';

COMMENT ON COLUMN bookings.payment_status IS 'Payment status: paid or unpaid (for frontend compatibility)';

-- RLS Policies migration completed successfully!
