


ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Photographers view own albums"
  ON albums FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Photographers can create albums"
  ON albums FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Photographers update own albums"
  ON albums FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Photographers delete own albums"
  ON albums FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Photographers view own photos"
  ON photos FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Photographers can insert photos"
  ON photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Photographers update own photos"
  ON photos FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Photographers delete own photos"
  ON photos FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Photographers view their payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Photographers update own payments"
  ON payments FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Customers view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Photographers can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'shotmarket-private'
    AND auth.uid() IS NOT NULL
    AND auth.role() = 'authenticated'
  );
CREATE POLICY "Photographers view own photos in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'shotmarket-private'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Photographers delete own photos in storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'shotmarket-private'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );








