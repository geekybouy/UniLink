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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (profileError && profileError.code !== 'PGRST116') {
        toast.error(`Failed to fetch your profile: ${profileError.message || "Unknown DB error"}`);
        throw profileError;
      }
      if (!profileData) {
        // Create a minimal new profile if doesn't exist (leave username for user to fill in)
        const { data: newProfileInsertData, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || 'New User',
            email: user.email || '',
            username: user.email ? user.email.split('@')[0] : `user_${user.id.substring(0, 8)}`,
            is_profile_complete: false,
          })
          .select()
          .single();
        if (createError) {
          toast.error('Error creating new profile: ' + createError.message);
          throw createError;
        }
        setProfile(newProfileInsertData as UserProfile);
        return;
      }
      setProfile(profileData as UserProfile);
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
    if (!user?.id || !profile) {
      toast.error('User not authenticated or profile not loaded for update.');
      throw new Error('User not authenticated or profile not loaded for update.');
    }
    try {
      const updateData: Record<string, any> = {};
      if (data.fullName !== undefined) updateData.full_name = data.fullName;
      if (data.username !== undefined) updateData.username = data.username;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.phone !== undefined) updateData.phone = data.phone;

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
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message || 'An unexpected error occurred.'}`);
      throw error;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user?.id || !profile) {
      toast.error('User not authenticated or profile not loaded for avatar upload.');
      return null;
    }
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase
        .storage
        .from('user-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      if (uploadError) {
        toast.error("Failed to upload photo: " + uploadError.message);
        throw uploadError;
      }
      const { data: publicUrlData } = supabase
        .storage
        .from('user-content')
        .getPublicUrl(filePath);
      const avatarUrl = publicUrlData.publicUrl;
      // Save image url in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);
      if (updateError) {
        toast.error("Failed to save uploaded photo URL: " + updateError.message);
        throw updateError;
      }
      setProfile(prev => prev ? { ...prev, avatarUrl: avatarUrl, updated_at: new Date().toISOString() } : prev);
      toast.success('Profile image uploaded successfully!');
      return avatarUrl;
    } catch (error: any) {
      toast.error(`Failed to upload image: ${error.message || 'An unexpected error occurred.'}`);
      return null;
    }
  };

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  // Completion: just basic fields for now
  const getProfileCompletion = (): number => {
    if (!profile) return 0;
    const fields = ['fullName', 'username', 'email', 'bio', 'location', 'avatarUrl'];
    let completed = 0;
    fields.forEach(f => {
      if ((profile as any)[f]) completed++;
    });
    return Math.round((completed / fields.length) * 100);
  };

  const isProfileCompleted = profile?.is_profile_complete || (getProfileCompletion() >= 80);

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
