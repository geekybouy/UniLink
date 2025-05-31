
import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem 
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X, CalendarIcon, PlusCircle } from 'lucide-react';
import { JobFormData, JobType, JobStatus, Company } from '@/types/jobs';
import { useJobs } from '@/contexts/JobsContext';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'];
const JOB_STATUSES = ['open', 'closed', 'filled'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  company_id: z.string().optional(),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  location: z.string().min(2, { message: "Location is required" }),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'internship'] as [JobType, ...JobType[]]),
  salary_range: z.string().optional(),
  experience_level: z.string().optional(),
  skills: z.array(z.string()),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  application_deadline: z.date().optional(),
  status: z.enum(['open', 'closed', 'filled'] as [JobStatus, ...JobStatus[]]),
});

type JobFormProps = {
  initialData?: JobFormData;
  onSubmit: (data: JobFormData) => void;
  isLoading?: boolean;
};

export default function JobForm({ initialData, onSubmit, isLoading = false }: JobFormProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [skill, setSkill] = useState('');
  const { fetchCompanies } = useJobs();

  const form = useForm<JobFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      location: '',
      job_type: 'full-time',
      skills: [],
      status: 'open'
    }
  });

  useEffect(() => {
    const loadCompanies = async () => {
      const fetchedCompanies = await fetchCompanies();
      setCompanies(fetchedCompanies);
    };
    loadCompanies();
  }, [fetchCompanies]);

  const handleFormSubmit = (data: JobFormData) => {
    onSubmit(data);
  };

  const addSkill = () => {
    if (skill.trim() && !form.getValues('skills').includes(skill.trim())) {
      const currentSkills = form.getValues('skills') || [];
      form.setValue('skills', [...currentSkills, skill.trim()]);
      setSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues('skills') || [];
    form.setValue('skills', currentSkills.filter(s => s !== skillToRemove));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title*</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Frontend Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide a detailed description of the job role and responsibilities"
                  className="min-h-[150px]"
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location*</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. New York, NY or Remote" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="job_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {JOB_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
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
            name="salary_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. $60,000 - $80,000/year" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>
                        {level}
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
            name="application_deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Application Deadline</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
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
                      disabled={(date) => date < new Date()}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {JOB_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="skills"
          render={() => (
            <FormItem>
              <FormLabel>Required Skills</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.getValues('skills')?.map(skill => (
                  <Badge key={skill} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
                    {skill}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full"
                      onClick={() => removeSkill(skill)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Add a skill"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Requirements</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List the requirements for this position"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="benefits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benefits</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the benefits offered with this position"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
            {isLoading ? "Submitting..." : initialData ? "Update Job" : "Post Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
