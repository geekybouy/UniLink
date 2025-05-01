import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/contexts/ProfileContext';
import { WorkExperience } from '@/types/profile';
import { typedSupabaseClient } from '@/integrations/supabase/customClient';
import { v4 as uuidv4 } from 'uuid';

interface WorkExperienceFormData {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentlyWorking: boolean;
  description: string;
}

const WorkExperienceStep = () => {
  const { profile, refreshProfile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workList, setWorkList] = useState<WorkExperience[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<WorkExperienceFormData>({
    defaultValues: {
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentlyWorking: false,
      description: ''
    }
  });
  
  const isCurrentlyWorking = watch('isCurrentlyWorking');
  
  useEffect(() => {
    if (profile?.workExperience) {
      setWorkList(profile.workExperience);
    }
  }, [profile]);

  const handleAdd = async (data: WorkExperienceFormData) => {
    try {
      setIsSubmitting(true);
      
      if (!profile) {
        toast.error('User profile not found');
        return;
      }
      
      const newWork: WorkExperience = {
        id: uuidv4(),
        company: data.company,
        position: data.position,
        location: data.location,
        startDate: data.startDate,
        endDate: data.isCurrentlyWorking ? null : data.endDate,
        isCurrentlyWorking: data.isCurrentlyWorking,
        description: data.description
      };
      
      // Add to database
      const { error } = await typedSupabaseClient.workExperience.insert({
        user_id: profile.userId,
        company: newWork.company,
        position: newWork.position,
        location: newWork.location,
        start_date: newWork.startDate,
        end_date: newWork.endDate,
        is_currently_working: newWork.isCurrentlyWorking,
        description: newWork.description
      });
      
      if (error) throw error;
      
      // Update local state
      setWorkList([...workList, newWork]);
      setIsAdding(false);
      reset();
      
      // Refresh profile data
      await refreshProfile();
      
      toast.success('Work experience added successfully');
    } catch (error: any) {
      toast.error('Failed to add work experience: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      if (!profile) return;
      
      // Delete from database
      const { error } = await typedSupabaseClient.workExperience.delete(id);
        
      if (error) throw error;
      
      // Update local state
      setWorkList(workList.filter(work => work.id !== id));
      
      // Refresh profile
      await refreshProfile();
      
      toast.success('Work experience removed');
    } catch (error: any) {
      toast.error('Failed to remove work experience: ' + error.message);
    }
  };
  
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {workList.length > 0 ? (
          workList.map((work) => (
            <Card key={work.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{work.position}</h3>
                    <p className="text-sm">{work.company}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(work.startDate)} - {work.isCurrentlyWorking ? 'Present' : formatDate(work.endDate || '')}
                    </p>
                    <p className="text-xs text-muted-foreground">{work.location}</p>
                    {work.description && (
                      <p className="text-sm mt-2">{work.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(work.id)}
                    aria-label="Delete work experience"
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-center">No work experience added</p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Add your work history to showcase your professional experience
            </p>
          </div>
        )}
      </div>
      
      {!isAdding ? (
        <Button 
          className="w-full"
          variant="outline" 
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Work Experience
        </Button>
      ) : (
        <Card className="border border-dashed p-4">
          <form onSubmit={handleSubmit(handleAdd)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company/Organization *</Label>
                <Input
                  id="company"
                  {...register('company', { required: 'Company is required' })}
                />
                {errors.company && (
                  <p className="text-sm text-destructive">{errors.company.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position/Title *</Label>
                <Input
                  id="position"
                  {...register('position', { required: 'Position is required' })}
                />
                {errors.position && (
                  <p className="text-sm text-destructive">{errors.position.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="month"
                  {...register('startDate', { required: 'Start date is required' })}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>
              
              {!isCurrentlyWorking && (
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="month"
                    {...register('endDate', {
                      required: !isCurrentlyWorking ? 'End date is required' : false
                    })}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-destructive">{errors.endDate.message}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isCurrentlyWorking" 
                checked={isCurrentlyWorking}
                onCheckedChange={(checked) => setValue('isCurrentlyWorking', checked)}
              />
              <Label htmlFor="isCurrentlyWorking">I currently work here</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your role and accomplishments..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Work Experience'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default WorkExperienceStep;
