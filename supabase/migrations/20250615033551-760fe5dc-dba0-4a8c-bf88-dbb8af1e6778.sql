
-- Grant admin privileges to the existing user 'jonchang1980@gmail.com'
UPDATE public.profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'jonchang1980@gmail.com');

-- Modify the function that handles new users to automatically assign the admin role to the very first user who signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET SEARCH_PATH = public
AS $$
BEGIN
  -- This will insert a new profile. If it's the first profile in the table,
  -- it will grant admin rights. Otherwise, it will not.
  INSERT INTO public.profiles (id, is_admin)
  VALUES (new.id, (SELECT COUNT(*) FROM public.profiles) = 0);
  RETURN new;
END;
$$;
