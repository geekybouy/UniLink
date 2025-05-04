
-- Function to get table columns without using RPC
-- This will be used to check if tables have certain columns
CREATE OR REPLACE FUNCTION public.get_column_exists(
  p_table_name text,
  p_column_name text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table_name
      AND column_name = p_column_name
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$;

-- Function to add new columns to posts table if they don't exist
CREATE OR REPLACE FUNCTION public.upgrade_posts_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add title column if it doesn't exist
  IF NOT public.get_column_exists('posts', 'title') THEN
    ALTER TABLE public.posts ADD COLUMN title text;
    -- Update existing posts to extract title from content
    UPDATE public.posts
    SET title = COALESCE(
      (SELECT CASE
        WHEN position(E'\n' in content) > 0
        THEN substring(content from 1 for position(E'\n' in content) - 1)
        ELSE content
      END),
      'Untitled Post'
    );
  END IF;
  
  -- Add content_type column if it doesn't exist
  IF NOT public.get_column_exists('posts', 'content_type') THEN
    ALTER TABLE public.posts ADD COLUMN content_type text DEFAULT 'article';
  END IF;
  
  -- Add file_url column if it doesn't exist
  IF NOT public.get_column_exists('posts', 'file_url') THEN
    ALTER TABLE public.posts ADD COLUMN file_url text;
    -- Set file_url to image_url for existing posts
    UPDATE public.posts
    SET file_url = image_url
    WHERE image_url IS NOT NULL;
  END IF;
  
  -- Add link_url column if it doesn't exist
  IF NOT public.get_column_exists('posts', 'link_url') THEN
    ALTER TABLE public.posts ADD COLUMN link_url text;
  END IF;
  
  -- Add updated_at column if it doesn't exist
  IF NOT public.get_column_exists('posts', 'updated_at') THEN
    ALTER TABLE public.posts ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    -- Set updated_at to created_at for existing posts
    UPDATE public.posts
    SET updated_at = created_at;
  END IF;
  
  -- Add is_featured column if it doesn't exist
  IF NOT public.get_column_exists('posts', 'is_featured') THEN
    ALTER TABLE public.posts ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
  
  -- Add is_approved column if it doesn't exist
  IF NOT public.get_column_exists('posts', 'is_approved') THEN
    ALTER TABLE public.posts ADD COLUMN is_approved boolean DEFAULT true;
  END IF;
END;
$$;
