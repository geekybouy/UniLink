import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useEvents } from '@/contexts/EventsContext';
import { EventGrid } from '@/components/events/EventGrid';
import { EventFilter, EventFilters } from '@/components/events/EventFilter';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { addDays, startOfDay, endOfDay, isSameDay, isWithinInterval, isAfter } from 'date-fns';

function EventsPage() {
  const { events, upcomingEvents, pastEvents, loading } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState(upcomingEvents);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  // Check if user is admin or alumni (can create events)
  const canCreateEvents = false; // Replace with real logic for user role check

  const handleFilterChange = (filters: EventFilters) => {
    let baseEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      baseEvents = baseEvents.filter(
        (event) =>
          event.name.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter (now expecting null instead of empty string for 'all')
    if (filters.category) {
      baseEvents = baseEvents.filter(
        (event) => event.category === filters.category
      );
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const today = startOfDay(new Date());
      
      if (filters.dateRange === 'today') {
        baseEvents = baseEvents.filter((event) =>
          isSameDay(new Date(event.date), today)
        );
      } else if (filters.dateRange === 'this-week') {
        const endOfWeek = endOfDay(addDays(today, 7));
        baseEvents = baseEvents.filter((event) =>
          isWithinInterval(new Date(event.date), {
            start: today,
            end: endOfWeek,
          })
        );
      } else if (filters.dateRange === 'this-month') {
        const endOfMonth = endOfDay(addDays(today, 30));
        baseEvents = baseEvents.filter((event) =>
          isWithinInterval(new Date(event.date), {
            start: today,
            end: endOfMonth,
          })
        );
      }
    }

    // Apply virtual filter
    if (filters.showVirtual) {
      baseEvents = baseEvents.filter((event) => event.is_virtual);
    }

    // Apply registered filter
    if (filters.showRegistered) {
      baseEvents = baseEvents.filter((event) => event.is_user_registered);
    }

    setFilteredEvents(baseEvents);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilteredEvents(value === 'upcoming' ? upcomingEvents : pastEvents);
  };

  // Update filtered events when base events change
  useEffect(() => {
    setFilteredEvents(activeTab === 'upcoming' ? upcomingEvents : pastEvents);
  }, [upcomingEvents, pastEvents, activeTab]);

  return (
    <MainLayout>
      <div className="container max-w-7xl py-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground mt-1">
              Discover and join upcoming alumni events
            </p>
          </div>
          
          {canCreateEvents && (
            <Button onClick={() => navigate('/events/new')}>
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Button>
          )}
        </div>
        
        <EventFilter onFilterChange={handleFilterChange} />
        
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            <EventGrid 
              events={filteredEvents} 
              emptyMessage="No upcoming events found" 
            />
          </TabsContent>
          
          <TabsContent value="past" className="mt-6">
            <EventGrid 
              events={filteredEvents} 
              emptyMessage="No past events found" 
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default EventsPage;
