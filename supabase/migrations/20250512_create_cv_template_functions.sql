
-- Create a function to get all CV templates
CREATE OR REPLACE FUNCTION public.get_cv_templates()
RETURNS TABLE (
  id text,
  name text,
  description text,
  image_preview_url text,
  template_file text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id::text, 
    name, 
    description, 
    image_preview_url, 
    template_file
  FROM cv_templates
  ORDER BY name;
$$;

-- Create a function to get a specific CV template by ID
CREATE OR REPLACE FUNCTION public.get_cv_template_by_id(template_id text)
RETURNS TABLE (
  id text,
  name text,
  description text,
  image_preview_url text,
  template_file text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id::text, 
    name, 
    description, 
    image_preview_url, 
    template_file
  FROM cv_templates
  WHERE id::text = template_id;
$$;
