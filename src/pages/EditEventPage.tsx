import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { EventForm } from '@/components/events/EventForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useEvents } from '@/contexts/EventsContext';
import { EventFormData, Event } from '@/types/events';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';

function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEventById, updateEvent } = useEvents();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    
    const loadEvent = async () => {
      setIsLoading(true);
      try {
        const eventData = await fetchEventById(id);
        
        if (!eventData) {
          toast.error('Event not found');
          navigate('/events');
          return;
        }
        
        // Remove role check; only allow creator of event to edit
        if (eventData.created_by !== user.id) {
          toast.error('You do not have permission to edit this event');
          navigate(`/events/${id}`);
          return;
        }
        
        setEvent(eventData);
        
        setFormData({
          name: eventData.name,
          description: eventData.description,
          date: new Date(eventData.date),
          end_date: eventData.end_date ? new Date(eventData.end_date) : undefined,
          location: eventData.location,
          category: eventData.category as any,
          is_virtual: eventData.is_virtual,
          virtual_link: eventData.virtual_link,
          max_attendees: eventData.max_attendees,
          is_public: eventData.is_public
        });
      } catch (error) {
        console.error('Error loading event:', error);
        toast.error('Failed to load event details');
        navigate('/events');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvent();
  }, [id, user, fetchEventById, navigate]);

  const handleSubmit = async (data: EventFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const updatedEvent = await updateEvent(id, data);
      if (updatedEvent) {
        toast.success('Event updated successfully');
        navigate(`/events/${id}`);
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-40 bg-muted rounded"></div>
            <div className="h-6 w-2/3 bg-muted rounded"></div>
            <div className="h-[400px] bg-muted rounded mt-8"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl py-6 space-y-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/events/${id}`)}
            className="mb-6"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground mt-1">
            Make changes to the event details
          </p>
        </div>
        
        <div className="border rounded-lg p-6 bg-card">
          {formData && (
            <EventForm 
              initialData={formData} 
              onSubmit={handleSubmit} 
              isLoading={isSubmitting} 
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default EditEventPage;
