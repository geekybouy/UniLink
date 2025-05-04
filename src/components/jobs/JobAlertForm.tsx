
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { JobType, AlertFrequency } from '@/types/jobs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JobAlertFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    job_type: JobType[];
    keywords: string[];
    locations: string[];
    frequency: AlertFrequency;
    is_active: boolean;
  }) => Promise<void>;
}

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const formSchema = z.object({
  job_type: z.array(z.string()).transform(arr => arr as JobType[]),
  keywords: z.array(z.string()),
  locations: z.array(z.string()),
  frequency: z.enum(['daily', 'weekly']),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function JobAlertForm({ isOpen, onClose, onSubmit }: JobAlertFormProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      job_type: [],
      keywords: [],
      locations: [],
      frequency: 'daily',
      is_active: true,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        job_type: values.job_type as JobType[],
        keywords: values.keywords,
        locations: values.locations,
        frequency: values.frequency as AlertFrequency,
        is_active: values.is_active
      });
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error creating job alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addKeyword = () => {
    if (keyword.trim() && !form.getValues('keywords').includes(keyword.trim())) {
      const currentKeywords = form.getValues('keywords');
      form.setValue('keywords', [...currentKeywords, keyword.trim()]);
      setKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    const currentKeywords = form.getValues('keywords');
    form.setValue('keywords', currentKeywords.filter(k => k !== keywordToRemove));
  };

  const addLocation = () => {
    if (location.trim() && !form.getValues('locations').includes(location.trim())) {
      const currentLocations = form.getValues('locations');
      form.setValue('locations', [...currentLocations, location.trim()]);
      setLocation('');
    }
  };

  const removeLocation = (locationToRemove: string) => {
    const currentLocations = form.getValues('locations');
    form.setValue('locations', currentLocations.filter(l => l !== locationToRemove));
  };

  const toggleJobType = (type: JobType, checked: boolean) => {
    const currentTypes = form.getValues('job_type');
    
    if (checked) {
      form.setValue('job_type', [...currentTypes, type]);
    } else {
      form.setValue('job_type', currentTypes.filter(t => t !== type));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Job Alert</DialogTitle>
          <DialogDescription>
            Get notified when new jobs matching your criteria are posted.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="job_type"
              render={() => (
                <FormItem className="space-y-4">
                  <FormLabel>Job Types</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {JOB_TYPES.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`job-type-${type.value}`}
                          checked={form.getValues('job_type').includes(type.value)}
                          onCheckedChange={(checked) => 
                            toggleJobType(type.value as JobType, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`job-type-${type.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem className="space-y-2">
              <FormLabel>Keywords</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.getValues('keywords')?.map(kw => (
                  <Badge key={kw} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
                    {kw}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full"
                      onClick={() => removeKeyword(kw)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="e.g. developer, marketing"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addKeyword}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
            
            <FormItem className="space-y-2">
              <FormLabel>Locations</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.getValues('locations')?.map(loc => (
                  <Badge key={loc} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
                    {loc}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full"
                      onClick={() => removeLocation(loc)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="e.g. New York, Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLocation();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addLocation}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
            
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="How often to receive alerts" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Active
                    </FormLabel>
                    <p className="text-muted-foreground text-sm">
                      Receive notifications for this alert
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Create Alert
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
