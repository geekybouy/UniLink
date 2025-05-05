
import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Mentor,
  MentorshipRequest,
  MentorshipRelationship,
  MentorshipSession,
  SessionFeedback,
  MentorshipResource,
  SuccessStory,
  MentorWithProfile,
  MentorMatch,
  ResourceType,
} from '@/types/mentorship';

interface MentorshipContextType {
  // Mentor Functions
  registerAsMentor: (mentorData: Omit<Mentor, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMentorProfile: (mentorId: string, mentorData: Partial<Mentor>) => Promise<void>;
  getMentorProfile: (userId?: string) => Promise<MentorWithProfile | null>;
  getAllMentors: () => Promise<MentorWithProfile[]>;
  
  // Mentee Functions
  requestMentorship: (requestData: Omit<MentorshipRequest, 'id' | 'mentee_id' | 'status' | 'created_at' | 'updated_at'>) => Promise<void>;
  cancelMentorshipRequest: (requestId: string) => Promise<void>;
  getMentorshipRequests: (isMentor?: boolean) => Promise<MentorshipRequest[]>;
  
  // Matching Function
  findMentorMatches: (interests: string[]) => Promise<MentorMatch[]>;
  
  // Relationship Functions
  acceptMentorshipRequest: (requestId: string) => Promise<void>;
  rejectMentorshipRequest: (requestId: string) => Promise<void>;
  getMentorshipRelationships: () => Promise<MentorshipRelationship[]>;
  
  // Session Functions
  scheduleSession: (sessionData: Omit<MentorshipSession, 'id' | 'status' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSessionStatus: (sessionId: string, status: 'completed' | 'canceled') => Promise<void>;
  getUpcomingSessions: () => Promise<MentorshipSession[]>;
  getPastSessions: () => Promise<MentorshipSession[]>;
  
  // Feedback Functions
  submitSessionFeedback: (feedbackData: Omit<SessionFeedback, 'id' | 'submitted_by' | 'created_at' | 'updated_at'>) => Promise<void>;
  getSessionFeedback: (sessionId: string) => Promise<SessionFeedback | null>;
  
  // Resource Functions
  shareResource: (resourceData: Omit<MentorshipResource, 'id' | 'shared_by' | 'created_at' | 'updated_at'>) => Promise<void>;
  getRelationshipResources: (relationshipId: string) => Promise<MentorshipResource[]>;
  
  // Success Story Functions
  submitSuccessStory: (storyData: Omit<SuccessStory, 'id' | 'is_featured' | 'is_published' | 'created_at' | 'updated_at'>) => Promise<void>;
  getSuccessStories: (featuredOnly?: boolean) => Promise<SuccessStory[]>;
}

const MentorshipContext = createContext<MentorshipContextType | undefined>(undefined);

export const useMentorship = () => {
  const context = useContext(MentorshipContext);
  if (!context) {
    throw new Error('useMentorship must be used within a MentorshipProvider');
  }
  return context;
};

export const MentorshipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Mentor Functions
  const registerAsMentor = async (mentorData: Omit<Mentor, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) throw new Error('You must be logged in to register as a mentor');

      const { error } = await supabase
        .from('mentors')
        .insert([{
          ...mentorData,
          user_id: user.id
        }]);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'You have registered as a mentor',
      });
    } catch (error) {
      console.error('Error registering as mentor:', error);
      toast({
        title: 'Error',
        description: 'Failed to register as mentor',
        variant: 'destructive',
      });
    }
  };

  const updateMentorProfile = async (mentorId: string, mentorData: Partial<Mentor>) => {
    try {
      if (!user) throw new Error('You must be logged in to update your mentor profile');

      const { error } = await supabase
        .from('mentors')
        .update(mentorData)
        .eq('id', mentorId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Mentor profile updated',
      });
    } catch (error) {
      console.error('Error updating mentor profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update mentor profile',
        variant: 'destructive',
      });
    }
  };

  const getMentorProfile = async (userId?: string): Promise<MentorWithProfile | null> => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return null;

      // First get the mentor record
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentors')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (mentorError) throw mentorError;
      
      if (!mentorData) return null;
      
      // Then get the profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, current_company, job_title')
        .eq('user_id', targetUserId)
        .single();
        
      if (profileError) throw profileError;
      
      // Combine the data and ensure proper type conversion for availability
      const mentorWithProfile: MentorWithProfile = {
        ...mentorData,
        // Convert Json to Record<string, any> or set to empty object if null
        availability: mentorData.availability ? 
          (typeof mentorData.availability === 'string' ? 
            JSON.parse(mentorData.availability) : 
            mentorData.availability as Record<string, any>) : 
          {},
        profile: profileData || {
          full_name: 'Unknown User',
          avatar_url: undefined,
          current_company: undefined,
          job_title: undefined
        }
      };
      
      return mentorWithProfile;
    } catch (error) {
      console.error('Error getting mentor profile:', error);
      return null;
    }
  };

  const getAllMentors = async (): Promise<MentorWithProfile[]> => {
    try {
      // First get all active mentors
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('mentors')
        .select('*')
        .eq('is_active', true);

      if (mentorsError) throw mentorsError;
      
      if (!mentorsData || mentorsData.length === 0) return [];
      
      // Get all user_ids to fetch profiles
      const userIds = mentorsData.map(mentor => mentor.user_id);
      
      // Fetch all profiles in one query
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, current_company, job_title')
        .in('user_id', userIds);
        
      if (profilesError) throw profilesError;
      
      // Map profiles to mentors
      const mentorsWithProfiles: MentorWithProfile[] = mentorsData.map(mentor => {
        const profile = profilesData?.find(p => p.user_id === mentor.user_id);
        
        // Convert Json availability to Record<string, any> or set to empty object
        const availability = mentor.availability ? 
          (typeof mentor.availability === 'string' ? 
            JSON.parse(mentor.availability) : 
            mentor.availability as Record<string, any>) : 
          {};
        
        return {
          ...mentor,
          availability,
          profile: profile ? {
            full_name: profile.full_name || 'Unknown User',
            avatar_url: profile.avatar_url,
            current_company: profile.current_company,
            job_title: profile.job_title
          } : {
            full_name: 'Unknown User',
            avatar_url: undefined,
            current_company: undefined,
            job_title: undefined
          }
        };
      });
      
      return mentorsWithProfiles;
    } catch (error) {
      console.error('Error getting mentors:', error);
      return [];
    }
  };

  // Mentee Functions
  const requestMentorship = async (requestData: Omit<MentorshipRequest, 'id' | 'mentee_id' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) throw new Error('You must be logged in to request mentorship');

      const { error } = await supabase
        .from('mentorship_requests')
        .insert([{
          ...requestData,
          mentee_id: user.id,
        }]);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Your mentorship request has been sent',
      });
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      toast({
        title: 'Error',
        description: 'Failed to send mentorship request',
        variant: 'destructive',
      });
    }
  };

  const cancelMentorshipRequest = async (requestId: string) => {
    try {
      if (!user) throw new Error('You must be logged in to cancel a request');

      const { error } = await supabase
        .from('mentorship_requests')
        .delete()
        .eq('id', requestId)
        .eq('mentee_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Mentorship request canceled',
      });
    } catch (error) {
      console.error('Error canceling request:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel request',
        variant: 'destructive',
      });
    }
  };

  const getMentorshipRequests = async (isMentor = false): Promise<MentorshipRequest[]> => {
    try {
      if (!user) return [];

      let query = supabase
        .from('mentorship_requests')
        .select('*');

      if (isMentor) {
        query = query.eq('mentor_id', user.id);
      } else {
        query = query.eq('mentee_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting mentorship requests:', error);
      return [];
    }
  };

  // Matching Function
  const findMentorMatches = async (interests: string[]): Promise<MentorMatch[]> => {
    try {
      if (!user) return [];

      const { data, error } = await supabase
        .rpc('match_mentee_with_mentors', {
          mentee_id: user.id,
          interests: interests
        });

      if (error) throw error;

      // Get profiles for all matched mentors
      if (data && data.length > 0) {
        const userIds = data.map(match => match.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, current_company, job_title')
          .in('user_id', userIds);

        if (profiles) {
          return data.map(match => {
            const profile = profiles.find(p => p.user_id === match.user_id);
            return {
              ...match,
              profile: profile || undefined
            };
          });
        }
      }

      return data || [];
    } catch (error) {
      console.error('Error finding mentor matches:', error);
      return [];
    }
  };

  // Relationship Functions
  const acceptMentorshipRequest = async (requestId: string) => {
    try {
      if (!user) throw new Error('You must be logged in to accept a request');

      // First update the request status
      const { data: request, error: requestError } = await supabase
        .from('mentorship_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .eq('mentor_id', user.id)
        .select()
        .single();

      if (requestError) throw requestError;

      // Then create the relationship
      const { error: relationshipError } = await supabase
        .from('mentorship_relationships')
        .insert([{
          mentor_id: user.id,
          mentee_id: request.mentee_id,
          goals: request.goals,
        }]);

      if (relationshipError) throw relationshipError;

      toast({
        title: 'Success',
        description: 'Mentorship request accepted',
      });
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept request',
        variant: 'destructive',
      });
    }
  };

  const rejectMentorshipRequest = async (requestId: string) => {
    try {
      if (!user) throw new Error('You must be logged in to reject a request');

      const { error } = await supabase
        .from('mentorship_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .eq('mentor_id', user.id);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Mentorship request rejected',
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  const getMentorshipRelationships = async (): Promise<MentorshipRelationship[]> => {
    try {
      if (!user) return [];

      const { data, error } = await supabase
        .from('mentorship_relationships')
        .select('*')
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting mentorship relationships:', error);
      return [];
    }
  };

  // Session Functions
  const scheduleSession = async (sessionData: Omit<MentorshipSession, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) throw new Error('You must be logged in to schedule a session');

      // Verify that the user is part of the relationship
      const { data: relationship, error: relationshipError } = await supabase
        .from('mentorship_relationships')
        .select('*')
        .eq('id', sessionData.relationship_id)
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .single();

      if (relationshipError || !relationship) {
        throw new Error('You are not part of this mentorship relationship');
      }

      const { error } = await supabase
        .from('mentorship_sessions')
        .insert([sessionData]);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Session scheduled',
      });
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast({
        title: 'Error',
        description: `Failed to schedule session: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  };

  const updateSessionStatus = async (sessionId: string, status: 'completed' | 'canceled') => {
    try {
      if (!user) throw new Error('You must be logged in to update a session');

      const { error } = await supabase
        .from('mentorship_sessions')
        .update({ status })
        .eq('id', sessionId);

      if (error) throw error;
      toast({
        title: 'Success',
        description: `Session marked as ${status}`,
      });
    } catch (error) {
      console.error('Error updating session status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update session status',
        variant: 'destructive',
      });
    }
  };

  const getUpcomingSessions = async (): Promise<MentorshipSession[]> => {
    try {
      if (!user) return [];

      // Get all relationships the user is part of
      const { data: relationships, error: relationshipError } = await supabase
        .from('mentorship_relationships')
        .select('id')
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`);

      if (relationshipError) throw relationshipError;

      if (!relationships || relationships.length === 0) {
        return [];
      }

      const relationshipIds = relationships.map(r => r.id);

      // Get upcoming sessions for these relationships
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .in('relationship_id', relationshipIds)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting upcoming sessions:', error);
      return [];
    }
  };

  const getPastSessions = async (): Promise<MentorshipSession[]> => {
    try {
      if (!user) return [];

      // Get all relationships the user is part of
      const { data: relationships, error: relationshipError } = await supabase
        .from('mentorship_relationships')
        .select('id')
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`);

      if (relationshipError) throw relationshipError;

      if (!relationships || relationships.length === 0) {
        return [];
      }

      const relationshipIds = relationships.map(r => r.id);

      // Get past sessions for these relationships
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .in('relationship_id', relationshipIds)
        .in('status', ['completed', 'canceled'])
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting past sessions:', error);
      return [];
    }
  };

  // Feedback Functions
  const submitSessionFeedback = async (feedbackData: Omit<SessionFeedback, 'id' | 'submitted_by' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) throw new Error('You must be logged in to submit feedback');

      const { error } = await supabase
        .from('session_feedback')
        .insert([{
          ...feedbackData,
          submitted_by: user.id
        }]);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Feedback submitted',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    }
  };

  const getSessionFeedback = async (sessionId: string): Promise<SessionFeedback | null> => {
    try {
      if (!user) return null;

      const { data, error } = await supabase
        .from('session_feedback')
        .select('*')
        .eq('session_id', sessionId)
        .eq('submitted_by', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned" error
      return data;
    } catch (error) {
      console.error('Error getting session feedback:', error);
      return null;
    }
  };

  // Resource Functions
  const shareResource = async (resourceData: Omit<MentorshipResource, 'id' | 'shared_by' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) throw new Error('You must be logged in to share a resource');

      const { error } = await supabase
        .from('mentorship_resources')
        .insert([{
          ...resourceData,
          shared_by: user.id
        }]);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Resource shared',
      });
    } catch (error) {
      console.error('Error sharing resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to share resource',
        variant: 'destructive',
      });
    }
  };

  const getRelationshipResources = async (relationshipId: string): Promise<MentorshipResource[]> => {
    try {
      const { data, error } = await supabase
        .from('mentorship_resources')
        .select('*')
        .eq('relationship_id', relationshipId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting resources:', error);
      return [];
    }
  };

  // Success Story Functions
  const submitSuccessStory = async (storyData: Omit<SuccessStory, 'id' | 'is_featured' | 'is_published' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) throw new Error('You must be logged in to submit a success story');

      const { error } = await supabase
        .from('success_stories')
        .insert([{
          ...storyData,
          is_published: false
        }]);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Success story submitted for review',
      });
    } catch (error) {
      console.error('Error submitting success story:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit success story',
        variant: 'destructive',
      });
    }
  };

  const getSuccessStories = async (featuredOnly = false): Promise<SuccessStory[]> => {
    try {
      let query = supabase
        .from('success_stories')
        .select('*')
        .eq('is_published', true);

      if (featuredOnly) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting success stories:', error);
      return [];
    }
  };

  const value = {
    registerAsMentor,
    updateMentorProfile,
    getMentorProfile,
    getAllMentors,
    requestMentorship,
    cancelMentorshipRequest,
    getMentorshipRequests,
    findMentorMatches,
    acceptMentorshipRequest,
    rejectMentorshipRequest,
    getMentorshipRelationships,
    scheduleSession,
    updateSessionStatus,
    getUpcomingSessions,
    getPastSessions,
    submitSessionFeedback,
    getSessionFeedback,
    shareResource,
    getRelationshipResources,
    submitSuccessStory,
    getSuccessStories,
  };

  return (
    <MentorshipContext.Provider value={value}>
      {children}
    </MentorshipContext.Provider>
  );
};
