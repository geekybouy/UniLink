
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
}
