
-- Stored procedure to add a user role
CREATE OR REPLACE FUNCTION public.add_user_role(user_id_param UUID, role_param TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id_param, role_param::user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Stored procedure to remove a user role
CREATE OR REPLACE FUNCTION public.remove_user_role(user_id_param UUID, role_param TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_roles
  WHERE user_id = user_id_param AND role = role_param::user_role;
END;
$$;

-- Alter the posts table to include a status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN status VARCHAR DEFAULT 'pending';
  END IF;
END$$;
