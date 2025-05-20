import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Event, EventFormData, EventAttendee, EventPhoto, AttendeeStatus, EventCategory, EventStatus } from '@/types/events';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';

interface EventsContextType {
  events: Event[];
  loading: boolean;
  upcomingEvents: Event[];
  pastEvents: Event[];
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<Event | null>;
  createEvent: (eventData: EventFormData) => Promise<Event | null>;
  updateEvent: (id: string, eventData: EventFormData) => Promise<Event | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  registerForEvent: (eventId: string) => Promise<boolean>;
  cancelRegistration: (eventId: string) => Promise<boolean>;
  isUserRegistered: (eventId: string) => boolean;
  getEventAttendees: (eventId: string) => Promise<EventAttendee[]>;
  uploadEventPhoto: (eventId: string, file: File, caption?: string) => Promise<EventPhoto | null>;
  getEventPhotos: (eventId: string) => Promise<EventPhoto[]>;
  deleteEventPhoto: (photoId: string) => Promise<boolean>;
  getUserEvents: () => Promise<Event[]>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    fetchEvents();
  }, [user]);

  // Fix the transformEvents function to ensure types match
  const transformEvents = async (events: any[]): Promise<Event[]> => {
    return Promise.all(
      events.map(async (event) => {
        // Check if the user is registered for this event
        let isRegistered = false;
        if (user) {
          const { data: attendeeData } = await supabase
            .from('event_attendees')
            .select('*')
            .eq('event_id', event.id)
            .eq('user_id', user.id)
            .eq('status', 'registered')
            .maybeSingle();
          isRegistered = !!attendeeData;
        }

        // Get attendees count
        const { count } = await supabase
          .from('event_attendees')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'registered');

        // Determine status based on date
        let status: EventStatus = event.status as EventStatus;
        const now = new Date();
        const eventDate = new Date(event.date);
        const endDate = event.end_date ? new Date(event.end_date) : new Date(eventDate.getTime() + (3 * 60 * 60 * 1000));
        
        if (now < eventDate) {
          status = 'upcoming';
        } else if (now > endDate) {
          status = 'past';
        } else {
          status = 'ongoing';
        }

        // Handle potentially undefined creator data - safely check for creator structure
        let creator = {
          full_name: 'Unknown',
          avatar_url: undefined as string | undefined
        };
        
        if (event.creator && typeof event.creator === 'object' && !('error' in event.creator)) {
          creator = {
            full_name: event.creator.full_name || 'Unknown',
            avatar_url: event.creator.avatar_url
          };
        }

        // Cast the category to the correct type
        const transformedEvent: Event = {
          ...event,
          category: event.category as EventCategory,
          attendees_count: count || 0,
          is_user_registered: isRegistered,
          status: status,
          creator
        };

        return transformedEvent;
      })
    );
  };

  // Update the fetchEvents function
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!events_created_by_fkey(full_name, avatar_url)
        `)
        .order('date', { ascending: true });

      if (error) throw error;

      // Transform dates and add computed properties
      const eventsWithComputedProps = await transformEvents(data);
      setEvents(eventsWithComputedProps);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventById = async (id: string): Promise<Event | null> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!events_created_by_fkey(full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if the user is registered for this event
      let isRegistered = false;
      if (user) {
        const { data: attendeeData } = await supabase
          .from('event_attendees')
          .select('*')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .eq('status', 'registered')
          .maybeSingle();
        isRegistered = !!attendeeData;
      }

      // Get attendees count
      const { count } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)
        .eq('status', 'registered');

      // Determine status based on date
      let status: EventStatus = data.status as EventStatus;
      const now = new Date();
      const eventDate = new Date(data.date);
      const endDate = data.end_date ? new Date(data.end_date) : new Date(eventDate.getTime() + (3 * 60 * 60 * 1000)); // Default 3 hours if no end date
      
      if (now < eventDate) {
        status = 'upcoming';
      } else if (now > endDate) {
        status = 'past';
      } else {
        status = 'ongoing';
      }

      // Handle potentially undefined creator data - safely check for creator structure
      let creator = {
        full_name: 'Unknown',
        avatar_url: undefined as string | undefined
      };
      
      // Create a temporary local variable to make TypeScript happy
      const creatorData = data.creator;
      
      // Fix with proper type assertions and null checks
      if (creatorData && typeof creatorData === 'object') {
        // Explicitly cast creatorData to a record type to avoid 'never' type errors
        const typedCreatorData = creatorData as Record<string, unknown>;
        
        // Now safely check if properties exist and use type guards
        const fullName = typedCreatorData.hasOwnProperty('full_name') && 
          typeof typedCreatorData.full_name === 'string' ? typedCreatorData.full_name : 'Unknown';
        
        // For avatar_url, safely check and cast
        const avatarUrl = typedCreatorData.hasOwnProperty('avatar_url') ? 
          typedCreatorData.avatar_url as string | undefined : undefined;
        
        creator = {
          full_name: fullName,
          avatar_url: avatarUrl
        };
      }

      const eventWithTypes: Event = {
        ...data,
        category: data.category as EventCategory,
        attendees_count: count || 0,
        is_user_registered: isRegistered,
        status,
        creator
      };

      return eventWithTypes;
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
      return null;
    }
  };

  const createEvent = async (eventData: EventFormData): Promise<Event | null> => {
    if (!user) {
      toast.error('You must be logged in to create an event');
      return null;
    }

    try {
      const eventImageUrl = eventData.event_image_file 
        ? await uploadEventImage(eventData.event_image_file) 
        : null;

      const { data, error } = await supabase
        .from('events')
        .insert({
          name: eventData.name,
          description: eventData.description,
          date: eventData.date.toISOString(),
          end_date: eventData.end_date ? eventData.end_date.toISOString() : null,
          location: eventData.location,
          category: eventData.category,
          is_virtual: eventData.is_virtual,
          virtual_link: eventData.virtual_link,
          max_attendees: eventData.max_attendees,
          is_public: eventData.is_public,
          event_image_url: eventImageUrl,
          created_by: user.id,
          status: 'upcoming'
        })
        .select()
        .single();

      if (error) throw error;

      // Add the necessary properties to make it a valid Event object
      const createdEvent: Event = {
        ...data,
        category: data.category as EventCategory,
        attendees_count: 0,
        is_user_registered: false,
        status: 'upcoming' as EventStatus,
        creator: {
          full_name: profile?.name || 'Unknown',
          avatar_url: profile?.profile_image_url
        }
      };

      toast.success('Event created successfully');
      await fetchEvents();
      return createdEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      return null;
    }
  };

  const updateEvent = async (id: string, eventData: EventFormData): Promise<Event | null> => {
    if (!user) {
      toast.error('You must be logged in to update an event');
      return null;
    }

    try {
      // First check if the user is allowed to update this event
      const { data: eventCheck, error: eventCheckError } = await supabase
        .from('events')
        .select('created_by')
        .eq('id', id)
        .single();

      if (eventCheckError) throw eventCheckError;
      
      if (eventCheck.created_by !== user.id) {
        // Remove role check as it's not available in UserProfile anymore
        // const isAdmin = profile?.role === 'admin';
        // if (!isAdmin) {
          toast.error('You are not authorized to update this event');
          return null;
        // }
      }

      let eventImageUrl = null;
      if (eventData.event_image_file) {
        eventImageUrl = await uploadEventImage(eventData.event_image_file);
      }

      const updateData: any = {
        name: eventData.name,
        description: eventData.description,
        date: eventData.date.toISOString(),
        location: eventData.location,
        category: eventData.category,
        is_virtual: eventData.is_virtual,
        virtual_link: eventData.virtual_link,
        max_attendees: eventData.max_attendees,
        is_public: eventData.is_public
      };

      if (eventData.end_date) {
        updateData.end_date = eventData.end_date.toISOString();
      }

      if (eventImageUrl) {
        updateData.event_image_url = eventImageUrl;
      }

      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create a properly typed Event object from the response
      const updatedEvent: Event = {
        ...data,
        category: data.category as EventCategory,
        attendees_count: 0, // We'll fetch this separately if needed
        is_user_registered: false, // We'll determine this separately if needed
        status: data.status as EventStatus,
        creator: {
          full_name: profile?.name || 'Unknown',
          avatar_url: profile?.profile_image_url
        }
      };

      toast.success('Event updated successfully');
      await fetchEvents();
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      return null;
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete an event');
      return false;
    }

    try {
      // Check if the user is allowed to delete this event
      const { data: eventCheck, error: eventCheckError } = await supabase
        .from('events')
        .select('created_by')
        .eq('id', id)
        .single();

      if (eventCheckError) throw eventCheckError;
      
      if (eventCheck.created_by !== user.id) {
        // Remove role check as it's not available in UserProfile anymore
        // const isAdmin = profile?.role === 'admin';
        // if (!isAdmin) {
          toast.error('You are not authorized to delete this event');
          return false;
        // }
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Event deleted successfully');
      setEvents((prevEvents) => prevEvents.filter(event => event.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      return false;
    }
  };

  const registerForEvent = async (eventId: string) => {
    if (!user) {
      toast.error('You must be logged in to register for an event');
      return false;
    }

    try {
      // Check if the event is full
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('max_attendees')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (eventData.max_attendees) {
        const { count, error: countError } = await supabase
          .from('event_attendees')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .eq('status', 'registered');

        if (countError) throw countError;

        if (count && count >= eventData.max_attendees) {
          toast.error('This event is already at full capacity');
          return false;
        }
      }

      // Check if the user is already registered
      const { data: existingReg, error: existingRegError } = await supabase
        .from('event_attendees')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingRegError) throw existingRegError;

      if (existingReg) {
        if (existingReg.status === 'registered') {
          toast.info('You are already registered for this event');
          return true;
        } else {
          // Update the existing registration status to 'registered'
          const { error: updateError } = await supabase
            .from('event_attendees')
            .update({ status: 'registered' })
            .eq('id', existingReg.id);

          if (updateError) throw updateError;
        }
      } else {
        // Create a new registration
        const { error: insertError } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'registered'
          });

        if (insertError) throw insertError;
      }

      toast.success('Successfully registered for the event');
      await fetchEvents(); // Refresh the events list
      return true;
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for the event');
      return false;
    }
  };

  const cancelRegistration = async (eventId: string) => {
    if (!user) {
      toast.error('You must be logged in to cancel your registration');
      return false;
    }

    try {
      const { error } = await supabase
        .from('event_attendees')
        .update({ status: 'canceled' })
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Registration canceled successfully');
      await fetchEvents(); // Refresh the events list
      return true;
    } catch (error) {
      console.error('Error canceling registration:', error);
      toast.error('Failed to cancel registration');
      return false;
    }
  };

  const isUserRegistered = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return !!event?.is_user_registered;
  };

  const getEventAttendees = async (eventId: string): Promise<EventAttendee[]> => {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          *,
          user:profiles!inner(full_name, avatar_url, email)
        `)
        .eq('event_id', eventId)
        .eq('status', 'registered');

      if (error) throw error;

      // Handle potential missing data and type issues
      return data.map(attendee => {
        // Ensure user data exists
        const userData = attendee.user || {};
        
        // Create a properly typed user object with safe property access
        const user = {
          full_name: 'Unknown User',
          avatar_url: undefined as string | undefined,
          email: 'No email' as string
        };
        
        // Only try to access properties if userData is an object
        if (typeof userData === 'object' && userData !== null) {
          if ('full_name' in userData && typeof userData.full_name === 'string') {
            user.full_name = userData.full_name;
          }
          if ('avatar_url' in userData) {
            // avatar_url can be undefined or string
            user.avatar_url = userData.avatar_url as string | undefined;
          }
          if ('email' in userData && typeof userData.email === 'string') {
            user.email = userData.email;
          }
        }
        
        return {
          ...attendee,
          user
        } as EventAttendee;
      });
    } catch (error) {
      console.error('Error fetching attendees:', error);
      toast.error('Failed to load attendees');
      return [];
    }
  };

  const uploadEventImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading event image:', error);
      return null;
    }
  };

  const uploadEventPhoto = async (eventId: string, file: File, caption?: string) => {
    if (!user) {
      toast.error('You must be logged in to upload photos');
      return null;
    }

    try {
      // Check if the user is registered for the event
      const { data: attendee, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .eq('status', 'registered')
        .maybeSingle();

      if (attendeeError) throw attendeeError;

      if (!attendee) {
        toast.error('You must be registered for this event to upload photos');
        return null;
      }

      // Upload the photo file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `event-photos/${eventId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);

      // Create the event photo record
      const { data, error } = await supabase
        .from('event_photos')
        .insert({
          event_id: eventId,
          photo_url: urlData.publicUrl,
          uploaded_by: user.id,
          caption: caption || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Photo uploaded successfully');
      return data;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      return null;
    }
  };

  const getEventPhotos = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_photos')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching event photos:', error);
      toast.error('Failed to load event photos');
      return [];
    }
  };

  const deleteEventPhoto = async (photoId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete photos');
      return false;
    }

    try {
      // First get the photo to check permissions and get the photo URL
      const { data: photo, error: photoError } = await supabase
        .from('event_photos')
        .select('*')
        .eq('id', photoId)
        .single();

      if (photoError) throw photoError;

      // Check if user is authorized (uploader or admin)
      if (photo.uploaded_by !== user.id) {
        // Remove admin check, simplify:
        // const isAdmin = profile?.role === 'admin';
        // if (!isAdmin) {
        //   const { data: event, error: eventError } = await supabase
        //     .from('events')
        //     .select('created_by')
        //     .eq('id', photo.event_id)
        //     .single();

        //   if (eventError) throw eventError;

        //   if (event.created_by !== user.id) {
              toast.error('You are not authorized to delete this photo');
              return false;
        //   }
        // }
      }

      // Delete the photo record
      const { error } = await supabase
        .from('event_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      // Try to delete the file from storage
      try {
        const photoPath = photo.photo_url.split('/').slice(-2).join('/');
        await supabase.storage
          .from('events')
          .remove([`event-photos/${photoPath}`]);
      } catch (storageError) {
        console.error('Failed to delete photo file from storage:', storageError);
        // Continue anyway since we've deleted the database record
      }

      toast.success('Photo deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
      return false;
    }
  };

  const getUserEvents = async () => {
    if (!user) {
      return [];
    }

    try {
      // Get events the user has registered for
      const { data: attendeeData, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('user_id', user.id)
        .eq('status', 'registered');

      if (attendeeError) throw attendeeError;
      
      const eventIds = attendeeData.map(item => item.event_id);
      
      if (eventIds.length === 0) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!events_created_by_fkey(full_name, avatar_url)
        `)
        .in('id', eventIds)
        .order('date', { ascending: true });

      if (error) throw error;
      
      // Transform to proper Event type array
      const transformedEvents = await transformEvents(data);
      
      // Set all as registered since these are the user's events
      transformedEvents.forEach(event => {
        event.is_user_registered = true;
      });
      
      return transformedEvents;
    } catch (error) {
      console.error('Error fetching user events:', error);
      toast.error('Failed to load your events');
      return [];
    }
  };

  // Derive upcoming and past events from the events list
  const upcomingEvents = events.filter(
    event => event.status === 'upcoming' || event.status === 'ongoing'
  );
  
  const pastEvents = events.filter(
    event => event.status === 'past'
  );

  const value: EventsContextType = {
    events,
    loading,
    upcomingEvents,
    pastEvents,
    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    cancelRegistration,
    isUserRegistered,
    getEventAttendees,
    uploadEventPhoto,
    getEventPhotos,
    deleteEventPhoto,
    getUserEvents
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};
