import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { EventFormData, EventCategory } from '@/types/events';

const eventCategories = [
  { label: 'Webinar', value: 'webinar' },
  { label: 'Meetup', value: 'meetup' },
  { label: 'Reunion', value: 'reunion' },
  { label: 'Conference', value: 'conference' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Networking', value: 'networking' },
  { label: 'Career Fair', value: 'career_fair' },
  { label: 'Social', value: 'social' },
  { label: 'Other', value: 'other' },
];

const eventFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Event name must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  date: z.date({
    required_error: 'Event date is required.',
  }),
  end_date: z.date().optional(),
  location: z.string().min(3, {
    message: 'Location is required.',
  }),
  category: z.string().optional(),
  is_virtual: z.boolean().default(false),
  virtual_link: z.string().url({
    message: 'Virtual link must be a valid URL.',
  }).optional().or(z.literal('')),
  max_attendees: z.number().int().positive().optional(),
  is_public: z.boolean().default(true),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  initialData?: EventFormData;
  onSubmit: (data: EventFormData) => void;
  isLoading?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.event_image_file ? URL.createObjectURL(initialData.event_image_file) : null
  );

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      date: initialData?.date || new Date(),
      end_date: initialData?.end_date,
      location: initialData?.location || '',
      category: initialData?.category || undefined,
      is_virtual: initialData?.is_virtual || false,
      virtual_link: initialData?.virtual_link || '',
      max_attendees: initialData?.max_attendees || undefined,
      is_public: initialData?.is_public !== undefined ? initialData.is_public : true,
    },
  });

  const isVirtual = form.watch('is_virtual');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (values: EventFormValues) => {
    const formData: EventFormData = {
      name: values.name,
      description: values.description,
      date: values.date,
      end_date: values.end_date,
      location: values.location,
      category: values.category as EventCategory | undefined,
      is_virtual: values.is_virtual,
      virtual_link: values.virtual_link,
      max_attendees: values.max_attendees,
      is_public: values.is_public,
      event_image_file: imageFile,
    };
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter the event name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide event details and description"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP HH:mm")
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
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(field.value);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date & Time (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP HH:mm")
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
                      selected={field.value || undefined}
                      onSelect={(date) => field.onChange(date)}
                      initialFocus
                      disabled={(date) => {
                        const startDate = form.getValues('date');
                        return date < startDate;
                      }}
                    />
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        value={field.value ? format(field.value, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = field.value ? new Date(field.value) : new Date(form.getValues('date'));
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          field.onChange(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Must be after the start date.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {eventCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_attendees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Attendees (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Leave blank for unlimited"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Maximum number of people who can register.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_virtual"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Virtual Event</FormLabel>
                <FormDescription>
                  Is this a virtual/online event?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isVirtual ? (
          <FormField
            control={form.control}
            name="virtual_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Virtual Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://meet.google.com/..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Link to the virtual meeting platform.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter venue/address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Public Event</FormLabel>
                <FormDescription>
                  Make this event visible to everyone.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Event Image (Optional)</FormLabel>
          <div className="grid gap-4">
            {imagePreview ? (
              <div className="relative aspect-video rounded-md overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="object-cover w-full h-full"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="event-image"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/25 hover:bg-muted/40"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      SVG, PNG, JPG or GIF (Max 2MB)
                    </p>
                  </div>
                  <input
                    id="event-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Event' : 'Create Event'}
        </Button>
      </form>
    </Form>
  );
};
