
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const mentorFormSchema = z.object({
  bio: z.string().min(30, 'Bio must be at least 30 characters'),
  expertise: z.array(z.string()).min(1, 'Add at least one area of expertise'),
  max_mentees: z.number().int().min(1, 'At least 1 mentee').max(10, 'Maximum 10 mentees'),
  availability: z.any().optional(),
});

type MentorFormValues = z.infer<typeof mentorFormSchema>;

interface RegisterMentorFormProps {
  onSubmit: (data: MentorFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function RegisterMentorForm({ onSubmit, isLoading }: RegisterMentorFormProps) {
  const [expertiseInput, setExpertiseInput] = useState('');
  const [expertiseList, setExpertiseList] = useState<string[]>([]);
  
  const form = useForm<MentorFormValues>({
    resolver: zodResolver(mentorFormSchema),
    defaultValues: {
      bio: '',
      expertise: [],
      max_mentees: 3,
    },
  });

  const addExpertise = () => {
    if (expertiseInput.trim() && !expertiseList.includes(expertiseInput.trim())) {
      const newExpertise = [...expertiseList, expertiseInput.trim()];
      setExpertiseList(newExpertise);
      form.setValue('expertise', newExpertise);
      setExpertiseInput('');
    }
  };

  const removeExpertise = (expertise: string) => {
    const newExpertise = expertiseList.filter(e => e !== expertise);
    setExpertiseList(newExpertise);
    form.setValue('expertise', newExpertise);
  };

  const handleSubmit = (values: MentorFormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Register as a Mentor</CardTitle>
        <CardDescription>
          Share your expertise and help guide the next generation of professionals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself, your experience, and how you can help mentees"
                      className="h-32 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expertise"
              render={() => (
                <FormItem>
                  <FormLabel>Areas of Expertise</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        placeholder="E.g. Web Development, Leadership"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addExpertise();
                          }
                        }}
                      />
                    </FormControl>
                    <Button type="button" onClick={addExpertise}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {expertiseList.map((expertise, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {expertise}
                        <X 
                          className="ml-1 h-3 w-3 cursor-pointer" 
                          onClick={() => removeExpertise(expertise)} 
                        />
                      </Badge>
                    ))}
                  </div>
                  {form.formState.errors.expertise && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.expertise.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_mentees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Number of Mentees</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      min={1} 
                      max={10} 
                    />
                  </FormControl>
                  <FormDescription>
                    The maximum number of mentees you're willing to mentor at once
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              Register as Mentor
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
