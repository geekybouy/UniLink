
-- Create stored procedures for fetching data

-- Get all tags
CREATE OR REPLACE FUNCTION public.get_all_tags()
RETURNS SETOF public.tags
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.tags;
$$;

-- Get post votes
CREATE OR REPLACE FUNCTION public.get_post_votes(post_ids UUID[])
RETURNS TABLE (
  post_id UUID,
  is_upvote BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT post_id, is_upvote 
  FROM public.votes
  WHERE post_id = ANY(post_ids);
$$;

-- Get post comments
CREATE OR REPLACE FUNCTION public.get_post_comments(post_ids UUID[])
RETURNS TABLE (
  post_id UUID,
  id UUID
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT post_id, id 
  FROM public.comments
  WHERE post_id = ANY(post_ids);
$$;

-- Get user votes for specific posts
CREATE OR REPLACE FUNCTION public.get_user_post_votes(user_id UUID, post_ids UUID[])
RETURNS TABLE (
  post_id UUID
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT post_id 
  FROM public.votes
  WHERE user_id = get_user_post_votes.user_id AND post_id = ANY(post_ids);
$$;

-- Get user bookmarks
CREATE OR REPLACE FUNCTION public.get_user_bookmarks(user_id UUID)
RETURNS TABLE (
  post_id UUID
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT post_id 
  FROM public.bookmarks
  WHERE user_id = get_user_bookmarks.user_id;
$$;

-- Get user bookmarks for specific posts
CREATE OR REPLACE FUNCTION public.get_user_post_bookmarks(user_id UUID, post_ids UUID[])
RETURNS TABLE (
  post_id UUID
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT post_id 
  FROM public.bookmarks
  WHERE user_id = get_user_post_bookmarks.user_id AND post_id = ANY(post_ids);
$$;
