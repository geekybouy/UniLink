
import { User } from "@supabase/supabase-js";

export type EventCategory = 
  | 'webinar'
  | 'meetup'
  | 'reunion'
  | 'conference'
  | 'workshop'
  | 'networking'
  | 'career_fair'
  | 'social'
  | 'other'
  | undefined;

export type EventStatus = 'upcoming' | 'ongoing' | 'past' | 'canceled';

export type AttendeeStatus = 'registered' | 'attended' | 'canceled';

export interface EventPhoto {
  id: string;
  event_id: string;
  photo_url: string;
  uploaded_by: string;
  caption?: string;
  created_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: AttendeeStatus;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  end_date?: string;
  location: string;
  created_by: string;
  category?: EventCategory;
  is_virtual: boolean;
  virtual_link?: string;
  event_image_url?: string;
  max_attendees?: number;
  calendar_link?: string;
  is_public: boolean;
  archive_url?: string;
  status: EventStatus;
  created_at: string;
  creator?: {
    full_name: string;
    avatar_url?: string;
  };
  attendees_count?: number;
  is_user_registered?: boolean;
}

export interface EventFormData {
  name: string;
  description: string;
  date: Date;
  end_date?: Date;
  location: string;
  category?: EventCategory;
  is_virtual: boolean;
  virtual_link?: string;
  max_attendees?: number;
  is_public: boolean;
  event_image_file?: File | null;
}
