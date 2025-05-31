export interface Tag {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  user?: {
    full_name: string;
    avatar_url?: string | null;
  };
  content_type?: string;
  file_url?: string;
  link_url?: string;
  tags?: Tag[];
  votes_count?: number;
  comments_count?: number;
  is_approved?: boolean;
  is_featured?: boolean;
  user_has_voted?: boolean;
  user_has_bookmarked?: boolean;
  image_url?: string;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  user?: {
    full_name: string;
    avatar_url?: string | null;
  };
}

export type ContentType = 'article' | 'link' | 'file' | 'image';

export interface PostFormData {
  title: string;
  content: string;
  content_type: ContentType;
  link_url?: string;
  tags?: string[];
}

export interface SearchParams {
  query?: string;
  contentType?: ContentType | 'all';
  tag?: string;
}

// Update UserRole type to include 'faculty'
export type UserRole = 'student' | 'alumni' | 'admin' | 'moderator' | 'faculty';
