import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useEvents } from '@/contexts/EventsContext';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Pencil, ChevronLeft, Trash2 } from 'lucide-react';
import { Event, EventAttendee, EventPhoto } from '@/types/events';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';
import { isPast } from 'date-fns';
import { EventDetails } from '@/components/events/EventDetails';
import { AttendeesList } from '@/components/events/AttendeesList';
import { EventPhotoGallery } from '@/components/events/EventPhotoGallery';
import { EventShareDialog } from '@/components/events/EventShareDialog';
import { CalendarIntegration } from '@/components/events/CalendarIntegration';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    fetchEventById, 
    registerForEvent, 
    cancelRegistration, 
    deleteEvent,
    getEventAttendees,
    getEventPhotos,
    uploadEventPhoto,
    deleteEventPhoto
  } = useEvents();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isRegistered = event?.is_user_registered || false;
  const isPastEvent = event ? isPast(new Date(event.date)) : false;
  
  // Check if user can edit this event
  const canEdit = event && user && (
    event.created_by === user.id
  );

  useEffect(() => {
    if (!id) return;
    
    const loadEventData = async () => {
      setLoading(true);
      try {
        const eventData = await fetchEventById(id);
        if (!eventData) {
          toast.error('Event not found');
          navigate('/events');
          return;
        }
        
        setEvent(eventData);
        
        // Load attendees
        const attendeesData = await getEventAttendees(id);
        setAttendees(attendeesData);
        
        // Load photos
        const photosData = await getEventPhotos(id);
        setPhotos(photosData);
      } catch (error) {
        console.error('Error loading event details:', error);
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    loadEventData();
  }, [id, fetchEventById, navigate]);

  const handleRegister = async () => {
    if (!event || !user) return;
    
    const success = await registerForEvent(event.id);
    if (success) {
      // Reload event to get updated registration status
      const updatedEvent = await fetchEventById(event.id);
      if (updatedEvent) {
        setEvent(updatedEvent);
      }
      
      // Reload attendees
      const attendeesData = await getEventAttendees(event.id);
      setAttendees(attendeesData);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event || !user) return;
    
    const success = await cancelRegistration(event.id);
    if (success) {
      // Reload event to get updated registration status
      const updatedEvent = await fetchEventById(event.id);
      if (updatedEvent) {
        setEvent(updatedEvent);
      }
      
      // Reload attendees
      const attendeesData = await getEventAttendees(event.id);
      setAttendees(attendeesData);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    
    const success = await deleteEvent(event.id);
    if (success) {
      toast.success('Event deleted successfully');
      navigate('/events');
    }
  };

  const handlePhotoUpload = async (file: File, caption: string) => {
    if (!event || !user) return;
    
    const photo = await uploadEventPhoto(event.id, file, caption);
    if (photo) {
      // Reload photos
      const photosData = await getEventPhotos(event.id);
      setPhotos(photosData);
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    if (!event || !user) return;
    
    const success = await deleteEventPhoto(photoId);
    if (success) {
      // Reload photos
      const photosData = await getEventPhotos(event.id);
      setPhotos(photosData);
    }
  };

  const getEventUrl = () => {
    return `${window.location.origin}/events/${event?.id}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-7xl py-12">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
            <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="mt-6 h-12 w-3/4 bg-muted animate-pulse rounded"></div>
          <div className="mt-4 space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-4/6 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="container max-w-7xl py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Event not found</h2>
            <p className="mt-2 text-muted-foreground">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => navigate('/events')}
              className="mt-6"
            >
              Back to Events
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/events')}
            className="inline-flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>

          {canEdit && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/events/${event.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Event
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
        
        <Separator />

        <EventDetails
          event={event}
          isRegistered={isRegistered}
          isPastEvent={isPastEvent}
          onRegister={handleRegister}
          onCancel={handleCancelRegistration}
          onAddToCalendar={() => setIsCalendarModalOpen(true)}
          onShare={() => setIsShareModalOpen(true)}
        />
        
        <Separator className="my-8" />
        
        <Tabs defaultValue="attendees">
          <TabsList>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            {isPastEvent && <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="attendees" className="mt-6">
            <AttendeesList attendees={attendees} />
          </TabsContent>
          
          {isPastEvent && (
            <TabsContent value="gallery" className="mt-6">
              <EventPhotoGallery 
                photos={photos}
                eventId={event.id}
                onUpload={handlePhotoUpload}
                onDelete={handlePhotoDelete}
              />
            </TabsContent>
          )}
        </Tabs>
        
        {/* Share Modal */}
        <EventShareDialog
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          eventName={event.name}
          eventUrl={getEventUrl()}
        />
        
        {/* Calendar Integration Modal */}
        <CalendarIntegration
          event={event}
          open={isCalendarModalOpen}
          onOpenChange={setIsCalendarModalOpen}
        />
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this event? This action cannot be undone.
                All registrations, photos, and other event data will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEvent}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}

export default EventDetailPage;
