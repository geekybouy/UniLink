export interface Education {
  id: string;
  university: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  isCurrentlyStudying: boolean;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrentlyWorking: boolean;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface SocialLink {
  id: string;
  platform: 'linkedin' | 'github' | 'twitter' | 'website' | 'other';
  url: string;
}

export interface PrivacySettings {
  email: 'public' | 'connections' | 'private';
  phone: 'public' | 'connections' | 'private';
  education: 'public' | 'connections' | 'private';
  workExperience: 'public' | 'connections' | 'private';
  skills: 'public' | 'connections' | 'private';
  socialLinks: 'public' | 'connections' | 'private';
  isAdmin?: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  phone: string | null;
  university: string | null;
  graduationYear: number | null;
  branch: string | null;
  location: string | null;
  registrationNumber: string | null;
  education: Education[];
  workExperience: WorkExperience[];
  skills: Skill[];
  socialLinks: SocialLink[];
  isProfileComplete: boolean;
  privacySettings: PrivacySettings;
  createdAt: string;
  updatedAt: string;
  role?: string;
  job_title?: string | null;
  current_company?: string | null;
}

export interface ProfileFormData {
  fullName: string;
  username: string;
  email: string;
  bio: string;
  phone?: string;
  university?: string;
  graduationYear?: number;
  branch?: string;
  location?: string;
  registrationNumber?: string;
  avatarFile?: File | null;
  isProfileComplete?: boolean;
}
