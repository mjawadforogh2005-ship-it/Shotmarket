-- ShotMarket RLS & Security Policies
-- Production-Ready Configuration
-- Execute in Supabase SQL Editor

-- ================================================================
-- PART 1: ENABLE RLS ON ALL TABLES
-- ================================================================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PART 2: PROFILES TABLE POLICIES
-- ================================================================

-- Photographers can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Photographers can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Photographers can insert their own profile
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ================================================================
-- PART 3: ALBUMS TABLE POLICIES
-- ================================================================

-- Photographers can view their own albums
CREATE POLICY "Photographers view own albums"
  ON albums FOR SELECT
  USING (auth.uid() = user_id);

-- Photographers can create albums
CREATE POLICY "Photographers can create albums"
  ON albums FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Photographers can update their own albums
CREATE POLICY "Photographers update own albums"
  ON albums FOR UPDATE
  USING (auth.uid() = user_id);

-- Photographers can delete their own albums
CREATE POLICY "Photographers delete own albums"
  ON albums FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- PART 4: PHOTOS TABLE POLICIES
-- ================================================================

-- Photographers can view their own photos
CREATE POLICY "Photographers view own photos"
  ON photos FOR SELECT
  USING (auth.uid() = user_id);

-- Photographers can upload photos to their albums
CREATE POLICY "Photographers can insert photos"
  ON photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Photographers can update their own photos
CREATE POLICY "Photographers update own photos"
  ON photos FOR UPDATE
  USING (auth.uid() = user_id);

-- Photographers can delete their own photos
CREATE POLICY "Photographers delete own photos"
  ON photos FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- PART 5: PAYMENTS TABLE POLICIES
-- ================================================================

-- Photographers can view payments for their albums
CREATE POLICY "Photographers view their payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Photographers can update payment status (approve/reject)
CREATE POLICY "Photographers update own payments"
  ON payments FOR UPDATE
  USING (auth.uid() = user_id);

-- Anonymous customers can view their own payments
CREATE POLICY "Customers view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = customer_id);

-- Anonymous customers can insert (create) payments
CREATE POLICY "Customers can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- ================================================================
-- PART 6: STORAGE POLICIES
-- ================================================================

-- Private photos bucket - only photographers can upload
CREATE POLICY "Photographers can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'shotmarket-private' 
    AND auth.uid() IS NOT NULL
    AND auth.role() = 'authenticated'
  );

-- Photographers can view their own uploaded photos
CREATE POLICY "Photographers view own photos in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'shotmarket-private'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Photographers can delete their own photos
CREATE POLICY "Photographers delete own photos in storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'shotmarket-private'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ================================================================
-- PART 7: EDGE FUNCTION BYPASS
-- ================================================================

-- These are handled by Edge Functions with SERVICE_ROLE_KEY:
-- - gallery-access: Allows anonymous customers to view gallery with valid token
-- - download-access: Allows customers to download paid photos with valid payment

-- ================================================================
-- TESTING QUERIES
-- ================================================================

-- Test 1: Verify photographer sees only their albums
-- SELECT * FROM albums WHERE user_id = (SELECT id FROM profiles WHERE id = auth.uid());

-- Test 2: Verify customer cannot see another photographer's albums
-- SELECT * FROM albums WHERE id != auth.uid() AND user_id IS NOT NULL; -- Should return 0

-- Test 3: Verify only photographer can approve their payments
-- SELECT * FROM payments WHERE user_id = auth.uid();

-- Test 4: Verify customer can only see their own payments
-- SELECT * FROM payments WHERE customer_id = auth.uid();

-- ================================================================
-- CLEANUP (if needed - removes all policies)
-- ================================================================

-- DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
-- DROP POLICY IF EXISTS "Photographers view own albums" ON albums;
-- DROP POLICY IF EXISTS "Photographers can create albums" ON albums;
-- DROP POLICY IF EXISTS "Photographers update own albums" ON albums;
-- DROP POLICY IF EXISTS "Photographers delete own albums" ON albums;
-- DROP POLICY IF EXISTS "Photographers view own photos" ON photos;
-- DROP POLICY IF EXISTS "Photographers can insert photos" ON photos;
-- DROP POLICY IF EXISTS "Photographers update own photos" ON photos;
-- DROP POLICY IF EXISTS "Photographers delete own photos" ON photos;
-- DROP POLICY IF EXISTS "Photographers view their payments" ON payments;
-- DROP POLICY IF EXISTS "Photographers update own payments" ON payments;
-- DROP POLICY IF EXISTS "Customers view own payments" ON payments;
-- DROP POLICY IF EXISTS "Customers can create payments" ON payments;
-- DROP POLICY IF EXISTS "Photographers can upload photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Photographers view own photos in storage" ON storage.objects;
-- DROP POLICY IF EXISTS "Photographers delete own photos in storage" ON storage.objects;
