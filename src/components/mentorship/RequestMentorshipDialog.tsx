
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const requestSchema = z.object({
  goals: z.string().min(10, 'Goals must be at least 10 characters'),
  message: z.string().optional(),
  interests: z.array(z.string()).min(1, 'Add at least one interest'),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestMentorshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: { goals: string; message?: string; interests: string[]; mentorId: string }) => void;
  mentorId: string;
  mentorName: string;
}

export function RequestMentorshipDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  mentorId,
  mentorName 
}: RequestMentorshipDialogProps) {
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      goals: '',
      message: '',
      interests: [],
    },
  });

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      const newInterests = [...interests, interestInput.trim()];
      setInterests(newInterests);
      form.setValue('interests', newInterests);
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    const newInterests = interests.filter(i => i !== interest);
    setInterests(newInterests);
    form.setValue('interests', newInterests);
  };

  const handleSubmit = (values: RequestFormValues) => {
    onSubmit({
      goals: values.goals, // Ensure goals is not optional here
      interests: values.interests,
      message: values.message,
      mentorId
    });
    form.reset();
    setInterests([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Mentorship from {mentorName}</DialogTitle>
          <DialogDescription>
            Share your goals and interests to help your potential mentor understand how they can help you.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are your mentorship goals?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="E.g. I want to improve my technical skills in web development and learn about career opportunities in the tech industry."
                      {...field} 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={() => (
                <FormItem>
                  <FormLabel>Your interests (add at least one)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        placeholder="E.g. Web Development"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addInterest();
                          }
                        }}
                      />
                    </FormControl>
                    <Button type="button" onClick={addInterest}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {interest}
                        <X 
                          className="ml-1 h-3 w-3 cursor-pointer" 
                          onClick={() => removeInterest(interest)} 
                        />
                      </Badge>
                    ))}
                  </div>
                  {form.formState.errors.interests && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.interests.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal message (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a personal message to your mentor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
