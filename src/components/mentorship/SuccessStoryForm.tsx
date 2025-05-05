
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { SuccessStory } from '@/types/mentorship';
import { StarRating } from './StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const successStorySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  story: z.string().min(30, "Please write at least 30 characters about your mentorship experience"),
  rating: z.number().min(1, "Please provide a rating").max(5),
});

type SuccessStoryFormValues = z.infer<typeof successStorySchema>;

interface SuccessStoryFormProps {
  relationshipId: string;
  onSubmit: (data: Omit<SuccessStory, 'id' | 'is_featured' | 'is_published' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

export function SuccessStoryForm({ relationshipId, onSubmit, isLoading }: SuccessStoryFormProps) {
  const form = useForm<SuccessStoryFormValues>({
    resolver: zodResolver(successStorySchema),
    defaultValues: {
      title: '',
      story: '',
      rating: 0,
    },
  });

  const handleSubmit = (values: SuccessStoryFormValues) => {
    onSubmit({
      relationship_id: relationshipId,
      title: values.title,
      story: values.story,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Success Story</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. How mentorship helped me land my dream job" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Rate your mentorship experience</FormLabel>
                  <FormControl>
                    <StarRating
                      rating={field.value}
                      onRatingChange={(value) => field.onChange(value)}
                      max={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="story"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Story</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your mentorship journey and how it impacted you..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your story will be reviewed before being published
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              Submit Success Story
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
