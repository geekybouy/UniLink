
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";
import { WizardStepProps } from './ProfileWizard';
import { useForm } from 'react-hook-form';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';

// Define explicit type for work experience entry
type WorkExperienceEntry = {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
};

const WorkExperienceStep = ({ onNext, onPrevious, isFirstStep, isLastStep, onStepSave }: WizardStepProps) => {
  const { profile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Explicitly define array element type
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceEntry[]>([
    {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }
  ]);

  // Provide form type to avoid TS 'never' error
  const { register, handleSubmit, formState: { errors } } = useForm<{ job_title?: string; current_company?: string; }>();

  const addWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
      }
    ]);
  };

  const removeWorkExperience = (index: number) => {
    if (workExperiences.length > 1) {
      setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    } else {
      toast.error("You must have at least one work experience entry");
    }
  };

  // Strictly type `field`
  const handleWorkExperienceChange = (
    index: number,
    field: keyof WorkExperienceEntry,
    value: string
  ) => {
    const updatedExperiences = [...workExperiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value
    };
    setWorkExperiences(updatedExperiences);
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (onStepSave) {
        await onStepSave(data);
      }
      onNext();
    } catch (error) {
      console.error("Failed to save work experience:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Current Position</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              id="job_title"
              {...register('job_title')}
              placeholder="Software Engineer"
            />
          </div>
          <div>
            <Label htmlFor="current_company">Current Company</Label>
            <Input
              id="current_company"
              {...register('current_company')}
              placeholder="Acme Inc."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Work Experience</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addWorkExperience}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Experience
          </Button>
        </div>

        {workExperiences.map((experience, index) => (
          <div key={index} className="border rounded-md p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Experience {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeWorkExperience(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Company</Label>
                <Input
                  value={experience.company}
                  onChange={(e) =>
                    handleWorkExperienceChange(index, 'company', e.target.value)
                  }
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={experience.position}
                  onChange={(e) =>
                    handleWorkExperienceChange(index, 'position', e.target.value)
                  }
                  placeholder="Job title"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={experience.startDate}
                  onChange={(e) =>
                    handleWorkExperienceChange(index, 'startDate', e.target.value)
                  }
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={experience.endDate}
                  onChange={(e) =>
                    handleWorkExperienceChange(index, 'endDate', e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={experience.description}
                onChange={(e) =>
                  handleWorkExperienceChange(index, 'description', e.target.value)
                }
                placeholder="Describe your responsibilities and achievements"
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep || isSubmitting}
        >
          Previous
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isLastStep ? 'Complete' : 'Next'}
        </Button>
      </div>
    </form>
  );
};

export default WorkExperienceStep;

// This file is getting quite long (~200 lines). Consider refactoring into smaller components for maintainability.
