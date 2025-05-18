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
        setProfile(null); // Clear profile if no user
        return;
      }
      
      console.log(`Fetching profile for user ID: ${user.id}`);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') { 
        console.error('Error fetching profile data:', profileError);
        throw profileError;
      }
      
      if (!profileData) {
        console.log(`No profile found for user ${user.id}, creating one.`);
        const defaultUsername = user.email ? user.email.split('@')[0] : `user_${uuidv4().substring(0, 8)}`;
        const { data: newProfileInsertData, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || 'New User',
            email: user.email || '',
            username: user.user_metadata?.user_name || defaultUsername,
            is_profile_complete: false,
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating new profile:', createError);
          throw createError;
        }
        
        if (newProfileInsertData) {
          console.log('New profile created:', newProfileInsertData);
          const emptyProfile: UserProfile = {
            id: newProfileInsertData.id.toString(),
            userId: newProfileInsertData.user_id || '',
            username: newProfileInsertData.username || '',
            fullName: newProfileInsertData.full_name || '',
            email: newProfileInsertData.email || '',
            bio: newProfileInsertData.bio || '',
            avatarUrl: newProfileInsertData.avatar_url || null,
            phone: null, 
            university: newProfileInsertData.university_name || null,
            graduationYear: newProfileInsertData.graduation_year || null,
            skills: (newProfileInsertData as any).skills || [], // Use (as any) if skills also causes issues, or ensure it's selected
            education: [],
            workExperience: [],
            socialLinks: [],
            location: newProfileInsertData.location || '',
            isProfileComplete: newProfileInsertData.is_profile_complete || false,
            privacySettings: {
              email: 'public', phone: 'public', education: 'public',
              workExperience: 'public', skills: 'public', socialLinks: 'public'
            },
            createdAt: (newProfileInsertData as any).created_at || new Date().toISOString(),
            updatedAt: (newProfileInsertData as any).updated_at || new Date().toISOString(),
            branch: newProfileInsertData.branch || null,
            registrationNumber: newProfileInsertData.registration_number || null,
            job_title: newProfileInsertData.job_title || null,
            current_company: newProfileInsertData.current_company || null
          };
          setProfile(emptyProfile);
          return; 
        } else {
          console.error('Failed to retrieve new profile data after creation.');
          setProfile(null);
          return;
        }
      }
      
      if (profileData) {
        console.log('Profile data found:', profileData);
        const [skillsRes, educationRes, workRes, socialRes] = await Promise.all([
          typedSupabaseClient.skills.getByUserId(user.id),
          typedSupabaseClient.education.getByUserId(user.id),
          typedSupabaseClient.workExperience.getByUserId(user.id),
          typedSupabaseClient.socialLinks.getByUserId(user.id)
        ]);

        const mappedEducation: Education[] = educationRes.data ? educationRes.data.map((edu: any) => ({
          id: edu.id,
          university: edu.university,
          degree: edu.degree,
          field: edu.field,
          startYear: edu.start_year,
          endYear: edu.end_year,
          isCurrentlyStudying: edu.is_currently_studying
        })) : [];
        
        const mappedWorkExperience: WorkExperience[] = workRes.data ? workRes.data.map((work: any) => ({
          id: work.id,
          company: work.company,
          position: work.position,
          location: work.location || '',
          startDate: work.start_date,
          endDate: work.end_date,
          isCurrentlyWorking: work.is_currently_working,
          description: work.description || ''
        })) : [];
        
        const mappedSocialLinks: SocialLink[] = socialRes.data ? socialRes.data.map((link: any) => ({
          id: link.id,
          platform: link.platform as "linkedin" | "github" | "twitter" | "website" | "other",
          url: link.url
        })) : [];

        const userProfile: UserProfile = {
          id: profileData.id.toString(),
          userId: profileData.user_id || '',
          username: profileData.username || '',
          fullName: profileData.full_name || '',
          email: profileData.email || '',
          bio: profileData.bio || '',
          avatarUrl: profileData.avatar_url || null,
          phone: null, 
          university: profileData.university_name || null,
          graduationYear: profileData.graduation_year || null,
          location: profileData.location || '',
          isProfileComplete: profileData.is_profile_complete || false,
          skills: (profileData as any).skills || skillsRes.data || [], // Also check skills from profileData if it's there
          education: mappedEducation,
          workExperience: mappedWorkExperience,
          socialLinks: mappedSocialLinks,
          privacySettings: { 
            email: 'public', phone: 'public', education: 'public',
            workExperience: 'public', skills: 'public', socialLinks: 'public'
          },
          createdAt: (profileData as any).created_at || new Date().toISOString(),
          updatedAt: (profileData as any).updated_at || new Date().toISOString(),
          branch: profileData.branch || null,
          registrationNumber: profileData.registration_number || null,
          job_title: profileData.job_title || null,
          current_company: profileData.current_company || null
        };
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Full error in fetchUserProfile:', error);
      setProfile(null); 
    } finally {
      setLoading(false);
      console.log('fetchUserProfile finished, loading set to false.');
    }
  };

  useEffect(() => {
    console.log('User changed:', user);
    if (user?.id) {
      fetchUserProfile();
    } else {
      setProfile(null);
      setLoading(false);
      console.log('User logged out or not available, profile cleared.');
    }
  }, [user]);

  const updateProfile = async (data: Partial<ProfileFormData>) => {
    console.log("updateProfile called with data:", data);
    if (!user?.id || !profile) {
      const errorMsg = 'User not authenticated or profile not loaded for update.';
      console.error(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      const updateData: Record<string, any> = {};
      
      if (data.fullName !== undefined) updateData.full_name = data.fullName;
      if (data.username !== undefined) updateData.username = data.username;
      if (data.email !== undefined) updateData.email = data.email; 
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.university !== undefined) updateData.university_name = data.university;
      if (data.graduationYear !== undefined) updateData.graduation_year = data.graduationYear;
      if (data.branch !== undefined) updateData.branch = data.branch;
      if (data.registrationNumber !== undefined) updateData.registration_number = data.registrationNumber;

      console.log("Data prepared for Supabase update:", updateData);

      if (Object.keys(updateData).length === 0) {
        console.log("No data to update.");
        return;
      }

      // The updated_at column will be handled by the database trigger
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log("Supabase update successful.");
      
      setProfile(prev => {
        if (!prev) return null;
        const updatedFields: Partial<UserProfile> = {};
        if (data.fullName !== undefined) updatedFields.fullName = data.fullName;
        if (data.username !== undefined) updatedFields.username = data.username;
        if (data.email !== undefined) updatedFields.email = data.email;
        if (data.bio !== undefined) updatedFields.bio = data.bio;
        if (data.location !== undefined) updatedFields.location = data.location;
        if (data.university !== undefined) updatedFields.university = data.university;
        if (data.graduationYear !== undefined) updatedFields.graduationYear = data.graduationYear;
        if (data.branch !== undefined) updatedFields.branch = data.branch;
        if (data.registrationNumber !== undefined) updatedFields.registrationNumber = data.registrationNumber;
        
        return {
          ...prev,
          ...updatedFields,
          updatedAt: new Date().toISOString(), // Reflect update time locally immediately
        };
      });
    } catch (error: any) {
      console.error('Failed to update profile in ProfileContext:', error);
      toast.error(`Failed to update profile: ${error.message || 'An unexpected error occurred.'}`);
      throw error; 
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    console.log("uploadAvatar called with file:", file.name);
    if (!user?.id || !profile) {
      const errorMsg = 'User not authenticated or profile not loaded for avatar upload.';
      console.error(errorMsg);
      toast.error(errorMsg);
      return null;
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Use the new public bucket 'user-content'
      const { error: uploadError } = await supabase
        .storage
        .from('user-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('user-content')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;
      console.log("Avatar public URL:", avatarUrl);

      // Save avatar url in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Supabase profile update error for avatar_url:', updateError);
        throw updateError;
      }

      setProfile(prev => {
        if (!prev) return null;
        return { ...prev, avatarUrl, updatedAt: new Date().toISOString() };
      });

      toast.success('Avatar uploaded successfully!');
      return avatarUrl;
    } catch (error: any) {
      console.error('Failed to upload avatar in ProfileContext:', error);
      toast.error(`Failed to upload avatar: ${error.message || 'An unexpected error occurred.'}`);
      return null;
    }
  };

  const refreshProfile = async () => {
    console.log("refreshProfile called.");
    await fetchUserProfile();
  };

  const getProfileCompletion = (): number => {
    if (!profile) return 0;

    let totalFields = 0;
    let completedFields = 0;

    const basicFields: (keyof UserProfile)[] = ['fullName', 'username', 'email', 'bio', 'avatarUrl', 'location', 'university', 'graduationYear', 'branch'];
    totalFields += basicFields.length;
    
    basicFields.forEach(field => {
      // Ensure profile[field] is not null or undefined before calling String() or trim()
      const fieldValue = profile[field];
      if (fieldValue !== null && fieldValue !== undefined && String(fieldValue).trim() !== '') {
        completedFields++;
      }
    });

    totalFields += 1; // Skills
    if (profile.skills && profile.skills.length > 0) completedFields++;

    totalFields += 1; // Education
    if (profile.education && profile.education.length > 0) completedFields++;

    totalFields += 1; // Work experience
    if (profile.workExperience && profile.workExperience.length > 0) completedFields++;

    totalFields += 1; // Social links
    if (profile.socialLinks && profile.socialLinks.length > 0) completedFields++;
    
    const completion = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    console.log(`Profile completion: ${completion}% (${completedFields}/${totalFields})`);
    return completion;
  };
  
  const isProfileCompleted = profile?.isProfileComplete || getProfileCompletion() > 80; 
  
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
