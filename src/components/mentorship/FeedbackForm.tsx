
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { SessionFeedback } from '@/types/mentorship';
import { StarRating } from './StarRating';

const feedbackFormSchema = z.object({
  rating: z.number().min(1, "Please provide a rating").max(5),
  feedback: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
  sessionId: string;
  onSubmit: (data: Omit<SessionFeedback, 'id' | 'submitted_by' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

export function FeedbackForm({ sessionId, onSubmit, isLoading }: FeedbackFormProps) {
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      rating: 0,
      feedback: '',
    },
  });

  const handleSubmit = (values: FeedbackFormValues) => {
    onSubmit({
      session_id: sessionId,
      rating: values.rating,
      feedback: values.feedback,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Rating</FormLabel>
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
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Share your thoughts about the session..."
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
          Submit Feedback
        </Button>
      </form>
    </Form>
  );
}
