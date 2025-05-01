
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, ProfileFormData } from '@/types/profile';
import { toast } from 'sonner';

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<ProfileFormData>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  getProfileCompletion: () => number;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch profile data from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch education data
      const { data: educationData, error: educationError } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', user.id);

      if (educationError) throw educationError;

      // Fetch work experience data
      const { data: workData, error: workError } = await supabase
        .from('work_experience')
        .select('*')
        .eq('user_id', user.id);

      if (workError) throw workError;

      // Fetch skills data
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id);

      if (skillsError) throw skillsError;

      // Fetch social links data
      const { data: socialData, error: socialError } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', user.id);

      if (socialError) throw socialError;

      // Fetch privacy settings
      const { data: privacyData, error: privacyError } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Convert profile data to our UserProfile format
      const userProfileData: UserProfile = {
        id: profileData.id.toString(),
        userId: profileData.user_id,
        fullName: profileData.full_name,
        email: profileData.email,
        username: profileData.username || '',
        bio: profileData.bio || '',
        avatarUrl: profileData.avatar_url,
        phone: profileData.phone || null,
        university: profileData.university_name,
        graduationYear: profileData.graduation_year,
        branch: profileData.branch,
        location: profileData.location,
        registrationNumber: profileData.registration_number,
        education: educationData || [],
        workExperience: workData || [],
        skills: skillsData || [],
        socialLinks: socialData || [],
        isProfileComplete: profileData.is_profile_complete || false,
        privacySettings: privacyData || {
          email: 'private',
          phone: 'private',
          education: 'public',
          workExperience: 'public',
          skills: 'public',
          socialLinks: 'public'
        },
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at || profileData.created_at
      };

      setProfile(userProfileData);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const updateProfile = async (data: Partial<ProfileFormData>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          username: data.username,
          bio: data.bio,
          phone: data.phone,
          university_name: data.university,
          graduation_year: data.graduationYear,
          branch: data.branch,
          location: data.location,
          registration_number: data.registrationNumber,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProfile();
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error('Failed to update profile: ' + err.message);
      throw err;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await fetchProfile();
      return avatarUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error('Failed to upload avatar');
      return null;
    }
  };

  const getProfileCompletion = (): number => {
    if (!profile) return 0;

    const fields = [
      !!profile.fullName,
      !!profile.username,
      !!profile.bio,
      !!profile.avatarUrl,
      !!profile.university,
      !!profile.graduationYear,
      !!profile.branch,
      !!profile.location,
      profile.education.length > 0,
      profile.workExperience.length > 0,
      profile.skills.length > 0,
      profile.socialLinks.length > 0
    ];

    const completedFields = fields.filter(field => field).length;
    return Math.floor((completedFields / fields.length) * 100);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const value = {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    getProfileCompletion,
    refreshProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
