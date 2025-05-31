
export interface Mentor {
  id: string;
  user_id: string;
  expertise: string[];
  bio: string;
  availability?: Record<string, any>;
  max_mentees: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MentorshipRequest {
  id: string;
  mentee_id: string;
  mentor_id?: string;
  goals: string;
  interests: string[];
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface MentorshipRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  goals: string;
  created_at: string;
  updated_at: string;
}

export interface MentorshipSession {
  id: string;
  relationship_id: string;
  scheduled_at: string;
  duration: number;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface SessionFeedback {
  id: string;
  session_id: string;
  submitted_by: string;
  rating: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface MentorshipResource {
  id: string;
  relationship_id?: string;
  shared_by: string;
  title: string;
  description?: string;
  resource_type: string;
  resource_url: string;
  created_at: string;
  updated_at: string;
}

export interface SuccessStory {
  id: string;
  relationship_id: string;
  title: string;
  story: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface MentorWithProfile extends Mentor {
  profile: {
    full_name: string;
    avatar_url?: string;
    current_company?: string;
    job_title?: string;
  }
}

export interface MentorMatch {
  mentor_id: string;
  user_id: string;
  expertise: string[];
  bio: string;
  match_score: number;
  profile?: {
    full_name: string;
    avatar_url?: string;
    current_company?: string;
    job_title?: string;
  }
}

export type ResourceType = 'article' | 'book' | 'video' | 'course' | 'document' | 'other';
