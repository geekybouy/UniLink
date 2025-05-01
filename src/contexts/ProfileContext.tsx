import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { customSupabase } from '../integrations/supabase/customClient';
import { 
  UserProfile, 
  Education, 
  WorkExperience, 
  Skill, 
  SocialLink, 
  PrivacySettings 
} from '../types/profile';

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  updateProfileImage: (file: File) => Promise<string>;
  addEducation: (education: Omit<Education, 'id'>) => Promise<void>;
  updateEducation: (id: string, education: Partial<Education>) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  addWorkExperience: (workExp: Omit<WorkExperience, 'id'>) => Promise<void>;
  updateWorkExperience: (id: string, workExp: Partial<WorkExperience>) => Promise<void>;
  deleteWorkExperience: (id: string) => Promise<void>;
  addSkill: (skill: Omit<Skill, 'id'>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  addSocialLink: (socialLink: Omit<SocialLink, 'id'>) => Promise<void>;
  updateSocialLink: (id: string, socialLink: Partial<SocialLink>) => Promise<void>;
  deleteSocialLink: (id: string) => Promise<void>;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  getProfileCompletion: () => number;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  isLoading: true,
  error: null,
  fetchProfile: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {},
  uploadAvatar: async () => "",
  updateProfileImage: async () => "",
  addEducation: async () => {},
  updateEducation: async () => {},
  deleteEducation: async () => {},
  addWorkExperience: async () => {},
  updateWorkExperience: async () => {},
  deleteWorkExperience: async () => {},
  addSkill: async () => {},
  deleteSkill: async () => {},
  addSocialLink: async () => {},
  updateSocialLink: async () => {},
  deleteSocialLink: async () => {},
  updatePrivacySettings: async () => {},
  getProfileCompletion: () => 0,
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const fetchProfile = async () => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await customSupabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw new Error(profileError.message);
      if (!profileData) throw new Error('Profile not found');

      // Fetch education records
      const { data: educationData, error: educationError } = await customSupabase
        .from('education')
        .select('*')
        .eq('user_id', userId);

      if (educationError) throw new Error(educationError.message);

      // Fetch work experience records
      const { data: workExperienceData, error: workExperienceError } = await customSupabase
        .from('work_experience')
        .select('*')
        .eq('user_id', userId);

      if (workExperienceError) throw new Error(workExperienceError.message);

      // Fetch skills
      const { data: skillsData, error: skillsError } = await customSupabase
        .from('skills')
        .select('*')
        .eq('user_id', userId);

      if (skillsError) throw new Error(skillsError.message);

      // Fetch social links
      const { data: socialLinksData, error: socialLinksError } = await customSupabase
        .from('social_links')
        .select('*')
        .eq('user_id', userId);

      if (socialLinksError) throw new Error(socialLinksError.message);

      // Default privacy settings if not set
      const defaultPrivacySettings: PrivacySettings = {
        email: 'connections',
        phone: 'connections',
        education: 'public',
        workExperience: 'public',
        skills: 'public',
        socialLinks: 'public',
      };

      // Convert data to UserProfile format
      const userProfile: UserProfile = {
        id: profileData.id.toString(),
        userId: profileData.user_id,
        fullName: profileData.full_name,
        email: profileData.email,
        username: profileData.username || '',
        bio: profileData.bio || '',
        avatarUrl: profileData.avatar_url,
        phone: profileData.phone || null,
        university: profileData.university_name || null,
        graduationYear: profileData.graduation_year || null,
        branch: profileData.branch || null,
        location: profileData.location || null,
        registrationNumber: profileData.registration_number || null,
        education: educationData?.map((edu) => ({
          id: edu.id,
          university: edu.university,
          degree: edu.degree,
          field: edu.field,
          startYear: edu.start_year,
          endYear: edu.end_year,
          isCurrentlyStudying: edu.is_currently_studying,
        })) || [],
        workExperience: workExperienceData?.map((work) => ({
          id: work.id,
          company: work.company,
          position: work.position,
          location: work.location || '',
          startDate: work.start_date,
          endDate: work.end_date,
          isCurrentlyWorking: work.is_currently_working,
          description: work.description || '',
        })) || [],
        skills: skillsData?.map((skill) => ({
          id: skill.id,
          name: skill.name,
        })) || [],
        socialLinks: socialLinksData?.map((link) => ({
          id: link.id,
          platform: link.platform as SocialLink['platform'],
          url: link.url,
        })) || [],
        isProfileComplete: profileData.is_profile_complete || false,
        privacySettings: defaultPrivacySettings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProfile(userProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    return updateProfileImage(file);
  };

  const getProfileCompletion = (): number => {
    if (!profile) return 0;
    
    let completedFields = 0;
    let totalFields = 0;
    
    // Basic info
    if (profile.fullName) completedFields++;
    if (profile.email) completedFields++;
    if (profile.username) completedFields++;
    totalFields += 3;
    
    // Optional fields
    if (profile.bio && profile.bio.length > 0) completedFields++;
    if (profile.avatarUrl) completedFields++;
    if (profile.phone) completedFields++;
    if (profile.location) completedFields++;
    totalFields += 4;
    
    // Education
    if (profile.education.length > 0) completedFields++;
    totalFields += 1;
    
    // Work experience
    if (profile.workExperience.length > 0) completedFields++;
    totalFields += 1;
    
    // Skills
    if (profile.skills.length > 0) completedFields++;
    totalFields += 1;
    
    // Social links
    if (profile.socialLinks.length > 0) completedFields++;
    totalFields += 1;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      // Convert profile data to match database schema
      const profileUpdate: any = {
        full_name: data.fullName,
        email: data.email,
        username: data.username,
        bio: data.bio,
        phone: data.phone,
        university_name: data.university,
        graduation_year: data.graduationYear,
        branch: data.branch,
        location: data.location,
        registration_number: data.registrationNumber,
        is_profile_complete: data.isProfileComplete,
      };

      // Remove undefined values
      Object.keys(profileUpdate).forEach(
        (key) => profileUpdate[key] === undefined && delete profileUpdate[key]
      );

      const { error: updateError } = await customSupabase
        .from('profiles')
        .update(profileUpdate)
        .eq('user_id', userId);

      if (updateError) throw new Error(updateError.message);

      // Update local state
      setProfile({ ...profile, ...data });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileImage = async (file: File): Promise<string> => {
    if (!userId || !profile) return '';

    try {
      setIsLoading(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload image to storage
      const { error: uploadError } = await customSupabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw new Error(uploadError.message);

      // Get public URL
      const { data: urlData } = customSupabase.storage.from('avatars').getPublicUrl(filePath);
      const avatarUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await customSupabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', userId);

      if (updateError) throw new Error(updateError.message);

      // Update local state
      setProfile({ ...profile, avatarUrl });
      return avatarUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile image');
      console.error('Error updating profile image:', err);
      return '';
    } finally {
      setIsLoading(false);
    }
  };

  // Education CRUD operations
  const addEducation = async (education: Omit<Education, 'id'>) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const newEducation = {
        user_id: userId,
        university: education.university,
        degree: education.degree,
        field: education.field,
        start_year: education.startYear,
        end_year: education.endYear,
        is_currently_studying: education.isCurrentlyStudying,
      };

      const { data, error: insertError } = await customSupabase
        .from('education')
        .insert(newEducation)
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      if (!data) throw new Error('Failed to add education');

      // Update local state
      const newEducationEntry: Education = {
        id: data.id,
        university: data.university,
        degree: data.degree,
        field: data.field,
        startYear: data.start_year,
        endYear: data.end_year,
        isCurrentlyStudying: data.is_currently_studying,
      };

      setProfile({
        ...profile,
        education: [...profile.education, newEducationEntry],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add education');
      console.error('Error adding education:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEducation = async (id: string, education: Partial<Education>) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const educationUpdate = {
        university: education.university,
        degree: education.degree,
        field: education.field,
        start_year: education.startYear,
        end_year: education.endYear,
        is_currently_studying: education.isCurrentlyStudying,
      };

      // Remove undefined values
      Object.keys(educationUpdate).forEach(
        (key) => educationUpdate[key] === undefined && delete educationUpdate[key]
      );

      const { error: updateError } = await customSupabase
        .from('education')
        .update(educationUpdate)
        .eq('id', id)
        .eq('user_id', userId);

      if (updateError) throw new Error(updateError.message);

      // Update local state
      const updatedEducation = profile.education.map((edu) =>
        edu.id === id ? { ...edu, ...education } : edu
      );

      setProfile({
        ...profile,
        education: updatedEducation,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update education');
      console.error('Error updating education:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEducation = async (id: string) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error: deleteError } = await customSupabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) throw new Error(deleteError.message);

      // Update local state
      const updatedEducation = profile.education.filter((edu) => edu.id !== id);
      setProfile({
        ...profile,
        education: updatedEducation,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete education');
      console.error('Error deleting education:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Work Experience CRUD operations
  const addWorkExperience = async (workExp: Omit<WorkExperience, 'id'>) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const newWorkExperience = {
        user_id: userId,
        company: workExp.company,
        position: workExp.position,
        location: workExp.location,
        start_date: workExp.startDate,
        end_date: workExp.endDate,
        is_currently_working: workExp.isCurrentlyWorking,
        description: workExp.description,
      };

      const { data, error: insertError } = await customSupabase
        .from('work_experience')
        .insert(newWorkExperience)
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      if (!data) throw new Error('Failed to add work experience');

      // Update local state
      const newWorkEntry: WorkExperience = {
        id: data.id,
        company: data.company,
        position: data.position,
        location: data.location || '',
        startDate: data.start_date,
        endDate: data.end_date,
        isCurrentlyWorking: data.is_currently_working,
        description: data.description || '',
      };

      setProfile({
        ...profile,
        workExperience: [...profile.workExperience, newWorkEntry],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add work experience');
      console.error('Error adding work experience:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkExperience = async (id: string, workExp: Partial<WorkExperience>) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const workUpdate = {
        company: workExp.company,
        position: workExp.position,
        location: workExp.location,
        start_date: workExp.startDate,
        end_date: workExp.endDate,
        is_currently_working: workExp.isCurrentlyWorking,
        description: workExp.description,
      };

      // Remove undefined values
      Object.keys(workUpdate).forEach(
        (key) => workUpdate[key] === undefined && delete workUpdate[key]
      );

      const { error: updateError } = await customSupabase
        .from('work_experience')
        .update(workUpdate)
        .eq('id', id)
        .eq('user_id', userId);

      if (updateError) throw new Error(updateError.message);

      // Update local state
      const updatedWorkExperience = profile.workExperience.map((work) =>
        work.id === id ? { ...work, ...workExp } : work
      );

      setProfile({
        ...profile,
        workExperience: updatedWorkExperience,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update work experience');
      console.error('Error updating work experience:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkExperience = async (id: string) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error: deleteError } = await customSupabase
        .from('work_experience')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) throw new Error(deleteError.message);

      // Update local state
      const updatedWorkExperience = profile.workExperience.filter(
        (work) => work.id !== id
      );
      setProfile({
        ...profile,
        workExperience: updatedWorkExperience,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete work experience');
      console.error('Error deleting work experience:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Skills CRUD operations
  const addSkill = async (skill: Omit<Skill, 'id'>) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const newSkill = {
        user_id: userId,
        name: skill.name,
      };

      const { data, error: insertError } = await customSupabase
        .from('skills')
        .insert(newSkill)
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      if (!data) throw new Error('Failed to add skill');

      // Update local state
      const newSkillEntry: Skill = {
        id: data.id,
        name: data.name,
      };

      setProfile({
        ...profile,
        skills: [...profile.skills, newSkillEntry],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add skill');
      console.error('Error adding skill:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSkill = async (id: string) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error: deleteError } = await customSupabase
        .from('skills')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) throw new Error(deleteError.message);

      // Update local state
      const updatedSkills = profile.skills.filter((skill) => skill.id !== id);
      setProfile({
        ...profile,
        skills: updatedSkills,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete skill');
      console.error('Error deleting skill:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Social Links CRUD operations
  const addSocialLink = async (socialLink: Omit<SocialLink, 'id'>) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const newSocialLink = {
        user_id: userId,
        platform: socialLink.platform,
        url: socialLink.url,
      };

      const { data, error: insertError } = await customSupabase
        .from('social_links')
        .insert(newSocialLink)
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      if (!data) throw new Error('Failed to add social link');

      // Update local state
      const newLinkEntry: SocialLink = {
        id: data.id,
        platform: data.platform as SocialLink['platform'],
        url: data.url,
      };

      setProfile({
        ...profile,
        socialLinks: [...profile.socialLinks, newLinkEntry],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add social link');
      console.error('Error adding social link:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSocialLink = async (id: string, socialLink: Partial<SocialLink>) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const linkUpdate = {
        platform: socialLink.platform,
        url: socialLink.url,
      };

      // Remove undefined values
      Object.keys(linkUpdate).forEach(
        (key) => linkUpdate[key] === undefined && delete linkUpdate[key]
      );

      const { error: updateError } = await customSupabase
        .from('social_links')
        .update(linkUpdate)
        .eq('id', id)
        .eq('user_id', userId);

      if (updateError) throw new Error(updateError.message);

      // Update local state
      const updatedSocialLinks = profile.socialLinks.map((link) =>
        link.id === id ? { ...link, ...socialLink } : link
      );

      setProfile({
        ...profile,
        socialLinks: updatedSocialLinks,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update social link');
      console.error('Error updating social link:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSocialLink = async (id: string) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error: deleteError } = await customSupabase
        .from('social_links')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) throw new Error(deleteError.message);

      // Update local state
      const updatedSocialLinks = profile.socialLinks.filter((link) => link.id !== id);
      setProfile({
        ...profile,
        socialLinks: updatedSocialLinks,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete social link');
      console.error('Error deleting social link:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrivacySettings = async (settings: Partial<PrivacySettings>) => {
    if (!userId || !profile) return;

    try {
      setIsLoading(true);
      setError(null);

      // Update local state only for now
      // In a real application, you'd store privacy settings in a dedicated table
      setProfile({
        ...profile,
        privacySettings: {
          ...profile.privacySettings,
          ...settings,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update privacy settings');
      console.error('Error updating privacy settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile on initial mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [userId]);

  const value = {
    profile,
    isLoading,
    error,
    fetchProfile,
    refreshProfile,
    updateProfile,
    uploadAvatar,
    updateProfileImage,
    addEducation,
    updateEducation,
    deleteEducation,
    addWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
    addSkill,
    deleteSkill,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    updatePrivacySettings,
    getProfileCompletion,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
