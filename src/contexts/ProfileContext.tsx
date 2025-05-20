
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile, ProfileFormData } from '@/types/profile';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (data: Partial<ProfileFormData>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
  getProfileCompletion: () => number;
  isProfileCompleted: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setProfile(null);
        return;
      }
      // Use user_id UUID for lookup, NOT id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (profileError) {
        toast.error(`Failed to fetch your profile: ${profileError.message || "Unknown error"}`);
        setProfile(null);
        throw profileError;
      }
      if (profileData) {
        setProfile({
          id: profileData.id.toString(),
          name: profileData.full_name || "",
          username: profileData.username || "",
          email: profileData.email || "",
          phone_number: null, // phone_number is not present in DB schema; set null 
          bio: profileData.bio ?? null,
          location: profileData.location ?? null,
          is_profile_complete: profileData.is_profile_complete ?? false,
          profile_image_url: profileData.avatar_url ?? null,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at,
        });
      } else {
        setProfile(null);
      }
    } catch (error: any) {
      toast.error("Could not load your profile. Check your connection or try logging in again.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (data: Partial<ProfileFormData>) => {
    if (!user?.id) {
      toast.error('User not authenticated.');
      throw new Error('User not authenticated');
    }
    try {
      const updateData: Record<string, any> = {};
      if (data.name !== undefined) updateData.full_name = data.name;
      if (data.username !== undefined) updateData.username = data.username;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.location !== undefined) updateData.location = data.location;
      // Remove phone_number, not stored in backend profile

      if (Object.keys(updateData).length === 0) return;
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);
      if (error) {
        toast.error(`Failed to save your profile: ${error.message || 'Unknown DB error.'}`);
        throw error;
      }
      setProfile(prev => prev ? { ...prev, ...updateData, updated_at: new Date().toISOString() } : prev);
      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message || 'An unexpected error occurred.'}`);
      throw error;
    }
  };

  // Upload profile image helper
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user?.id) {
      toast.error('User not authenticated.');
      return null;
    }
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile_photos/${fileName}`;
      const { error: uploadError } = await supabase
        .storage
        .from('profile_photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      if (uploadError) {
        toast.error("Failed to upload photo: " + uploadError.message);
        throw uploadError;
      }
      const { data: publicUrlData } = await supabase
        .storage
        .from('profile_photos')
        .getPublicUrl(filePath);
      const imageUrl = publicUrlData.publicUrl;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: imageUrl })
        .eq('user_id', user.id);
      if (updateError) {
        toast.error("Failed to save uploaded photo URL: " + updateError.message);
        throw updateError;
      }
      setProfile((prev) =>
        prev ? { ...prev, profile_image_url: imageUrl, updated_at: new Date().toISOString() } : prev
      );
      toast.success('Profile image uploaded successfully!');
      return imageUrl;
    } catch (error: any) {
      toast.error(`Failed to upload image: ${error.message || 'An unexpected error occurred.'}`);
      return null;
    }
  };

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  const getProfileCompletion = (): number => {
    if (!profile) return 0;
    const fields = ['name', 'username', 'email', 'bio', 'location', 'profile_image_url'];
    let completed = 0;
    fields.forEach(f => {
      if ((profile as any)[f]) completed++;
    });
    return Math.round((completed / fields.length) * 100);
  };

  const isProfileCompleted = profile?.is_profile_complete ?? false;

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        updateProfile,
        uploadAvatar,
        refreshProfile,
        getProfileCompletion,
        isProfileCompleted,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
