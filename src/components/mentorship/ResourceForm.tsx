
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { MentorshipResource, ResourceType } from '@/types/mentorship';

const resourceFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  resource_type: z.string(),
  resource_url: z.string().url("Please enter a valid URL"),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

interface ResourceFormProps {
  relationshipId: string;
  onSubmit: (data: Omit<MentorshipResource, 'id' | 'shared_by' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

export function ResourceForm({ relationshipId, onSubmit, isLoading }: ResourceFormProps) {
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: '',
      description: '',
      resource_type: 'article',
      resource_url: '',
    },
  });

  const handleSubmit = (values: ResourceFormValues) => {
    onSubmit({
      title: values.title,
      description: values.description,
      resource_type: values.resource_type as ResourceType,
      resource_url: values.resource_url,
      relationship_id: relationshipId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resource Title</FormLabel>
              <FormControl>
                <Input placeholder="E.g. Intro to Web Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="resource_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resource type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resource_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of the resource..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : null}
          Share Resource
        </Button>
      </form>
    </Form>
  );
}
