
import { Database } from '@/integrations/supabase/types';

export type ContentType = 'article' | 'link' | 'file' | 'image';

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string | null;
  user_id: string;
  content_type: ContentType;
  file_url: string | null;
  link_url: string | null;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  is_approved: boolean;
  tags?: Tag[];
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
  votes_count?: number;
  comments_count?: number;
  user_has_voted?: boolean;
  user_has_bookmarked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface Vote {
  id: string;
  user_id: string;
  post_id: string;
  is_upvote: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export type PostFormData = {
  title: string;
  content: string;
  content_type: ContentType;
  link_url?: string;
  tags: string[];
};

export type SearchParams = {
  query: string;
  contentType?: ContentType | 'all';
  tag?: string;
  featured?: boolean;
};
