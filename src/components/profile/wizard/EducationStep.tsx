import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash, School } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/contexts/ProfileContext';
import { Education } from '@/types/profile';
import { typedSupabaseClient } from '@/integrations/supabase/customClient';
import { v4 as uuidv4 } from 'uuid';

// Add import for the step props type
import { WizardStepProps } from './ProfileWizard';

interface EducationFormData {
  university: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  isCurrentlyStudying: boolean;
}

// Accept WizardStepProps, but let the component work standalone for edit
const EducationStep: React.FC<Partial<WizardStepProps>> = ({
  onPrevious,
  onNext,
  isFirstStep = false,
  isLastStep = false
}) => {
  const { profile, refreshProfile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<EducationFormData>({
    defaultValues: {
      university: '',
      degree: '',
      field: '',
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear() + 4,
      isCurrentlyStudying: false
    }
  });

  const isCurrentlyStudying = watch('isCurrentlyStudying');

  useEffect(() => {
    if (profile?.education) {
      setEducationList(profile.education);
    }
  }, [profile]);

  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 50; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  };

  const handleAdd = async (data: EducationFormData) => {
    try {
      setIsSubmitting(true);
      if (!profile) {
        toast.error('User profile not found');
        return;
      }
      const newEducation: Education = {
        id: uuidv4(),
        university: data.university,
        degree: data.degree,
        field: data.field,
        startYear: data.startYear,
        endYear: data.isCurrentlyStudying ? null : data.endYear,
        isCurrentlyStudying: data.isCurrentlyStudying
      };
      // Add to database
      const { error } = await typedSupabaseClient.education.insert({
        user_id: profile.userId,
        university: newEducation.university,
        degree: newEducation.degree,
        field: newEducation.field,
        start_year: newEducation.startYear,
        end_year: newEducation.endYear,
        is_currently_studying: newEducation.isCurrentlyStudying
      });
      if (error) throw error;
      setEducationList([...educationList, newEducation]);
      setIsAdding(false);
      reset();
      await refreshProfile();
      toast.success('Education added successfully');
    } catch (error: any) {
      toast.error('Failed to add education: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!profile) return;
      const { error } = await typedSupabaseClient.education.delete(id);
      if (error) throw error;
      setEducationList(educationList.filter(edu => edu.id !== id));
      await refreshProfile();
      toast.success('Education removed');
    } catch (error: any) {
      toast.error('Failed to remove education: ' + error.message);
    }
  };

  const handleStartYearChange = (value: string) => {
    setValue('startYear', parseInt(value));
  };

  const handleEndYearChange = (value: string) => {
    setValue('endYear', parseInt(value));
  };

  // New: add next/previous nav buttons below add/cancel/add-education form
  const showNext = typeof onNext === 'function';
  const showPrevious = typeof onPrevious === 'function';

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {educationList.length > 0 ? (
          educationList.map((education) => (
            <Card key={education.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{education.university}</h3>
                    <p className="text-sm text-muted-foreground">
                      {education.degree} in {education.field}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {education.startYear} - {education.isCurrentlyStudying ? 'Present' : education.endYear}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(education.id)}
                    aria-label="Delete education"
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
            <School className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-center">No education details added</p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Add your education history to help others connect with you
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
          <Plus className="mr-2 h-4 w-4" /> Add Education
        </Button>
      ) : (
        <Card className="border border-dashed p-4">
          <form onSubmit={handleSubmit(handleAdd)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="university">University/Institution *</Label>
              <Input
                id="university"
                {...register('university', { required: 'University is required' })}
              />
              {errors.university && (
                <p className="text-sm text-destructive">{errors.university.message}</p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree *</Label>
                <Input
                  id="degree"
                  {...register('degree', { required: 'Degree is required' })}
                  placeholder="e.g., Bachelor's, Master's"
                />
                {errors.degree && (
                  <p className="text-sm text-destructive">{errors.degree.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="field">Field of Study *</Label>
                <Input
                  id="field"
                  {...register('field', { required: 'Field is required' })}
                  placeholder="e.g., Computer Science"
                />
                {errors.field && (
                  <p className="text-sm text-destructive">{errors.field.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startYear">Start Year *</Label>
                <Select onValueChange={handleStartYearChange}>
                  <SelectTrigger id="startYear">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions().map(year => (
                      <SelectItem key={`start-${year}`} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!isCurrentlyStudying && (
                <div className="space-y-2">
                  <Label htmlFor="endYear">End Year *</Label>
                  <Select onValueChange={handleEndYearChange}>
                    <SelectTrigger id="endYear">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions().map(year => (
                        <SelectItem key={`end-${year}`} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isCurrentlyStudying"
                checked={isCurrentlyStudying}
                onCheckedChange={checked => setValue('isCurrentlyStudying', checked)}
              />
              <Label htmlFor="isCurrentlyStudying">I am currently studying here</Label>
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
                {isSubmitting ? 'Adding...' : 'Add Education'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Navigation Stepper for Wizard */}
      {(showPrevious || showNext) && (
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstStep}
          >
            Previous
          </Button>
          <Button
            type="button"
            onClick={onNext}
            disabled={educationList.length === 0}
            variant="default"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default EducationStep;
