
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, ProfileFormData, Skill, Education, WorkExperience, SocialLink } from '@/types/profile';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { typedSupabaseClient } from '@/integrations/supabase/customClient';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (data: Partial<ProfileFormData>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
  getProfileCompletion: () => number;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) return;
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      if (!profileData) {
        // Create a new profile if one doesn't exist
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || '',
            email: user.email || '',
            username: '',
            password: '', // Required field in the database
            is_profile_complete: false
          });
          
        if (createError) throw createError;
        
        const { data: newProfileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (newProfileData) {
          const emptyProfile: UserProfile = {
            id: newProfileData.id.toString(), // Convert number to string
            userId: newProfileData.user_id || '',
            username: newProfileData.username || '',
            fullName: newProfileData.full_name || '',
            email: newProfileData.email || '',
            bio: newProfileData.bio || '',
            avatarUrl: newProfileData.avatar_url || null,
            phone: null, // Not in database, set as null
            university: newProfileData.university_name || null, // Map to university_name
            graduationYear: newProfileData.graduation_year || null,
            skills: [],
            education: [],
            workExperience: [],
            socialLinks: [],
            location: newProfileData.location || '',
            isProfileComplete: false,
            privacySettings: {
              email: 'public',
              phone: 'public',
              education: 'public',
              workExperience: 'public',
              skills: 'public',
              socialLinks: 'public'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            branch: newProfileData.branch || null,
            registrationNumber: newProfileData.registration_number || null,
            job_title: newProfileData.job_title || null,
            current_company: newProfileData.current_company || null
          };
          
          setProfile(emptyProfile);
          return;
        }
      }
      
      if (profileData) {
        // Fetch skills
        const { data: skillsData } = await typedSupabaseClient.skills
          .getByUserId(user.id);
        
        // Fetch education
        const { data: educationData } = await typedSupabaseClient.education
          .getByUserId(user.id);
        
        // Fetch work experience
        const { data: workData } = await typedSupabaseClient.workExperience
          .getByUserId(user.id);
        
        // Fetch social links
        const { data: socialData } = await typedSupabaseClient.socialLinks
          .getByUserId(user.id);
        
        // Map education data to match our Education type
        const mappedEducation: Education[] = educationData ? educationData.map((edu: any) => ({
          id: edu.id,
          university: edu.university,
          degree: edu.degree,
          field: edu.field,
          startYear: edu.start_year,
          endYear: edu.end_year,
          isCurrentlyStudying: edu.is_currently_studying
        })) : [];
        
        // Map work experience data to match our WorkExperience type
        const mappedWorkExperience: WorkExperience[] = workData ? workData.map((work: any) => ({
          id: work.id,
          company: work.company,
          position: work.position,
          location: work.location || '',
          startDate: work.start_date,
          endDate: work.end_date,
          isCurrentlyWorking: work.is_currently_working,
          description: work.description || ''
        })) : [];
        
        // Map social links data to match our SocialLink type with proper platform type casting
        const mappedSocialLinks: SocialLink[] = socialData ? socialData.map((link: any) => ({
          id: link.id,
          platform: link.platform as "linkedin" | "github" | "twitter" | "website" | "other",
          url: link.url
        })) : [];
        
        const userProfile: UserProfile = {
          id: profileData.id.toString(), // Convert number to string
          userId: profileData.user_id || '',
          username: profileData.username || '',
          fullName: profileData.full_name || '',
          email: profileData.email || '',
          bio: profileData.bio || '',
          avatarUrl: profileData.avatar_url || null,
          phone: null, // Not in database schema
          university: profileData.university_name || null, // Map to university_name
          graduationYear: profileData.graduation_year || null,
          location: profileData.location || '',
          isProfileComplete: profileData.is_profile_complete || false,
          skills: skillsData || [],
          education: mappedEducation,
          workExperience: mappedWorkExperience,
          socialLinks: mappedSocialLinks,
          privacySettings: {
            email: 'public',
            phone: 'public',
            education: 'public',
            workExperience: 'public',
            skills: 'public',
            socialLinks: 'public'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          branch: profileData.branch || null,
          registrationNumber: profileData.registration_number || null,
          job_title: profileData.job_title || null,
          current_company: profileData.current_company || null
        };
        
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
    try {
      if (!user?.id || !profile) {
        throw new Error('User not authenticated or profile not loaded');
      }
      
      // Prepare data for update
      const updateData: Record<string, any> = {};
      
      // Map form fields to database fields
      if (data.fullName !== undefined) updateData.full_name = data.fullName;
      if (data.username !== undefined) updateData.username = data.username;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.university !== undefined) updateData.university_name = data.university; // Map to university_name
      if (data.graduationYear !== undefined) updateData.graduation_year = data.graduationYear;
      if (data.branch !== undefined) updateData.branch = data.branch;
      if (data.registrationNumber !== undefined) updateData.registration_number = data.registrationNumber;
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...data
        };
      });
      
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
      throw error;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      if (!user?.id || !profile) {
        throw new Error('User not authenticated or profile not loaded');
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase
        .storage
        .from('user-content')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase
        .storage
        .from('user-content')
        .getPublicUrl(filePath);
        
      const avatarUrl = data.publicUrl;
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          avatarUrl
        };
      });
      
      return avatarUrl;
    } catch (error: any) {
      toast.error('Failed to upload avatar: ' + error.message);
      return null;
    }
  };

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  const getProfileCompletion = (): number => {
    if (!profile) return 0;

    let totalFields = 0;
    let completedFields = 0;

    // Basic info
    const basicFields = ['fullName', 'username', 'email', 'bio', 'avatarUrl', 'location'];
    totalFields += basicFields.length;
    
    basicFields.forEach(field => {
      if (profile[field as keyof UserProfile]) completedFields++;
    });

    // Skills
    totalFields += 1;
    if (profile.skills && profile.skills.length > 0) completedFields++;

    // Education
    totalFields += 1;
    if (profile.education && profile.education.length > 0) completedFields++;

    // Work experience
    totalFields += 1;
    if (profile.workExperience && profile.workExperience.length > 0) completedFields++;

    // Social links
    totalFields += 1;
    if (profile.socialLinks && profile.socialLinks.length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        updateProfile,
        uploadAvatar,
        refreshProfile,
        getProfileCompletion
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
