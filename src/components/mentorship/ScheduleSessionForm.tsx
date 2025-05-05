
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { MentorshipSession } from '@/types/mentorship';
import { Spinner } from '@/components/ui/spinner';

const sessionFormSchema = z.object({
  scheduledDate: z.date({
    required_error: "Please select a date",
  }).refine(date => date > new Date(), {
    message: "Date must be in the future"
  }),
  scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in 24-hour format (HH:MM)"
  }),
  duration: z.number().int().min(15, "Sessions must be at least 15 minutes").max(180, "Sessions cannot be longer than 3 hours"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  notes: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

interface ScheduleSessionFormProps {
  relationshipId: string;
  onSubmit: (data: Omit<MentorshipSession, 'id' | 'status' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

export function ScheduleSessionForm({ relationshipId, onSubmit, isLoading }: ScheduleSessionFormProps) {
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      scheduledDate: undefined,
      scheduledTime: '',
      duration: 60,
      location: '',
      notes: '',
    },
  });

  const handleSubmit = (values: SessionFormValues) => {
    const { scheduledDate, scheduledTime } = values;
    
    // Combine date and time
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledAt = new Date(scheduledDate);
    scheduledAt.setHours(hours, minutes, 0, 0);
    
    onSubmit({
      relationship_id: relationshipId,
      scheduled_at: scheduledAt.toISOString(),
      duration: values.duration,
      location: values.location,
      notes: values.notes,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduledTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="HH:MM (24-hour format)"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Enter time in 24-hour format (e.g., 14:30)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value) || 60)}
                />
              </FormControl>
              <FormDescription>
                How long the session will last in minutes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Zoom link, Google Meet, Office location, etc."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Where the session will take place (link for virtual meetings)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Notes (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Agenda, topics to discuss, preparation required, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : null}
          Schedule Session
        </Button>
      </form>
    </Form>
  );
}
