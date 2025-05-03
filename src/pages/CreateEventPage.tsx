
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { EventForm } from '@/components/events/EventForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useEvents } from '@/contexts/EventsContext';
import { EventFormData } from '@/types/events';

function CreateEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { createEvent } = useEvents();

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const event = await createEvent(data);
      if (event) {
        navigate(`/events/${event.id}`);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-6 space-y-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/events')}
            className="mb-6"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
          <p className="text-muted-foreground mt-1">
            Fill out the form below to create a new event
          </p>
        </div>
        
        <div className="border rounded-lg p-6 bg-card">
          <EventForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
      </div>
    </MainLayout>
  );
}

export default CreateEventPage;
