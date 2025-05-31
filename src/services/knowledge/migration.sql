
-- Function to get table columns
CREATE OR REPLACE FUNCTION public.get_table_columns(
  p_table_name text
)
RETURNS TABLE (
  column_name text,
  data_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text
  FROM 
    information_schema.columns c
  WHERE 
    c.table_schema = 'public' AND 
    c.table_name = get_table_columns.p_table_name;
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
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'posts'
      AND column_name = 'title'
  ) THEN
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
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'posts'
      AND column_name = 'content_type'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN content_type text DEFAULT 'article';
  END IF;
  
  -- Add file_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'posts'
      AND column_name = 'file_url'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN file_url text;
    -- Set file_url to image_url for existing posts
    UPDATE public.posts
    SET file_url = image_url
    WHERE image_url IS NOT NULL;
  END IF;
  
  -- Add link_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'posts'
      AND column_name = 'link_url'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN link_url text;
  END IF;
  
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'posts'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    -- Set updated_at to created_at for existing posts
    UPDATE public.posts
    SET updated_at = created_at;
  END IF;
  
  -- Add is_featured column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'posts'
      AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
  
  -- Add is_approved column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'posts'
      AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN is_approved boolean DEFAULT true;
  END IF;
END;
$$;
