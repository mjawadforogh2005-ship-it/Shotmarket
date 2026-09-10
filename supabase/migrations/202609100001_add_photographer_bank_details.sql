ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account_name text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS bank_currency text NOT NULL DEFAULT 'KZT';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    bank_name,
    bank_account_name,
    bank_account_number,
    bank_currency
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data ->> 'bank_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'bank_account_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'bank_account_number', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'bank_currency', ''), 'KZT')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_shotmarket_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
