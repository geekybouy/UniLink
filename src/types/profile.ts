
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone_number: string | null;
  bio: string | null;
  location: string | null;
  is_profile_complete: boolean;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  bio?: string;
  phone_number?: string;
  location?: string;
  profile_image_file?: File | null;
}

