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
      
      // Fetch profile data
      console.log(`Fetching profile for user ID: ${user.id}`);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') { // PGRST116: no rows found
        console.error('Error fetching profile data:', profileError);
        throw profileError;
      }
      
      if (!profileData) {
        console.log(`No profile found for user ${user.id}, creating one.`);
        // Create a new profile if one doesn't exist
        const defaultUsername = user.email ? user.email.split('@')[0] : `user_${uuidv4().substring(0, 8)}`;
        const { data: newProfileInsertData, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || 'New User',
            email: user.email || '',
            username: user.user_metadata?.user_name || defaultUsername,
            is_profile_complete: false,
            // ensure required fields like email and full_name are present
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
            skills: [],
            education: [],
            workExperience: [],
            socialLinks: [],
            location: newProfileInsertData.location || '',
            isProfileComplete: newProfileInsertData.is_profile_complete || false,
            privacySettings: {
              email: 'public', phone: 'public', education: 'public',
              workExperience: 'public', skills: 'public', socialLinks: 'public'
            },
            createdAt: newProfileInsertData.created_at || new Date().toISOString(),
            updatedAt: newProfileInsertData.updated_at || new Date().toISOString(),
            branch: newProfileInsertData.branch || null,
            registrationNumber: newProfileInsertData.registration_number || null,
            job_title: newProfileInsertData.job_title || null,
            current_company: newProfileInsertData.current_company || null
          };
          setProfile(emptyProfile);
          return; // Early return after setting new profile
        } else {
          console.error('Failed to retrieve new profile data after creation.');
          // Potentially set profile to null or a default error state
          setProfile(null);
          return;
        }
      }
      
      // If profileData exists, proceed to fetch related data
      if (profileData) {
        console.log('Profile data found:', profileData);
        // Fetch skills, education, work experience, social links...
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
          phone: null, // Phone not in DB 'profiles' table
          university: profileData.university_name || null,
          graduationYear: profileData.graduation_year || null,
          location: profileData.location || '',
          isProfileComplete: profileData.is_profile_complete || false,
          skills: skillsRes.data || [],
          education: mappedEducation,
          workExperience: mappedWorkExperience,
          socialLinks: mappedSocialLinks,
          privacySettings: { // Default privacy settings
            email: 'public', phone: 'public', education: 'public',
            workExperience: 'public', skills: 'public', socialLinks: 'public'
          },
          createdAt: profileData.created_at || new Date().toISOString(),
          updatedAt: profileData.updated_at || new Date().toISOString(),
          branch: profileData.branch || null,
          registrationNumber: profileData.registration_number || null,
          job_title: profileData.job_title || null,
          current_company: profileData.current_company || null
        };
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Full error in fetchUserProfile:', error);
      setProfile(null); // Set profile to null on error
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
      if (data.email !== undefined) updateData.email = data.email; // Assuming email can be updated
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.university !== undefined) updateData.university_name = data.university;
      if (data.graduationYear !== undefined) updateData.graduation_year = data.graduationYear;
      if (data.branch !== undefined) updateData.branch = data.branch;
      if (data.registrationNumber !== undefined) updateData.registration_number = data.registrationNumber;
      // The 'profiles' table does not have a 'phone' column.
      // If you want to save phone, you'll need to add a migration for it.
      // if (data.phone !== undefined) updateData.phone = data.phone; // Temporarily commented out

      // Add is_profile_complete if certain fields are filled,
      // For now, let's assume any update makes it more complete or means user is working on it.
      // A more robust check for completion should be done based on specific criteria.
      // updateData.is_profile_complete = true; // Or calculate based on data

      console.log("Data prepared for Supabase update:", updateData);

      if (Object.keys(updateData).length === 0) {
        console.log("No data to update.");
        // toast.info("No changes to save."); // Optional: inform user if no actual data changed
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log("Supabase update successful.");
      
      // Update local state more accurately
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
        // if (data.phone !== undefined) updatedFields.phone = data.phone; // Reflect in local state if it were saved
        
        return {
          ...prev,
          ...updatedFields,
          // isProfileComplete: prev.isProfileComplete || true, // Update based on logic
          updatedAt: new Date().toISOString(), // Reflect update time
        };
      });
      // toast.success('Profile updated successfully!'); // Moved to PersonalInfoStep for context
    } catch (error: any) {
      console.error('Failed to update profile in ProfileContext:', error);
      toast.error(`Failed to update profile: ${error.message || 'An unexpected error occurred.'}`);
      throw error; // Re-throw to be caught by the calling component
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    console.log("uploadAvatar called with file:", file.name);
    if (!user?.id || !profile) {
      const errorMsg = 'User not authenticated or profile not loaded for avatar upload.';
      console.error(errorMsg);
      toast.error(errorMsg);
      return null; // throw new Error(errorMsg) could also be an option
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      console.log(`Uploading avatar to: user-content/${filePath}`);
      const { error: uploadError } = await supabase
        .storage
        .from('user-content') // Ensure this bucket exists and has RLS/policies for uploads
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Important for replacing existing avatar if same path logic used (not here due to Date.now())
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
      return null; // Or throw error
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
      if (profile[field] && String(profile[field]).trim() !== '') completedFields++;
    });

    // Consider arrays non-empty as 'completed' for this basic calculation
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
  
  const isProfileCompleted = profile?.isProfileComplete || getProfileCompletion() > 80; // Example threshold
  
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
