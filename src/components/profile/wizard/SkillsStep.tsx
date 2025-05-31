import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { WizardStepProps } from './ProfileWizard';
import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

const SkillsStep: React.FC<WizardStepProps> = ({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  onStepSave
}) => {
  const { profile } = useProfile();
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      // Note: Since skills aren't part of the UserProfile type,
      // we're not actually saving them to the profile
      // This would need to be implemented in a separate table
      
      // For now, just proceed to the next step
      onNext();
    } catch (error) {
      console.error("Error saving skills:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="skills">Add your skills</Label>
        <div className="flex gap-2">
          <Input
            id="skills"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a skill (e.g., JavaScript, Project Management)"
          />
          <Button type="button" onClick={handleAddSkill}>Add</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Press Enter to add a skill or click the Add button
        </p>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[100px]">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="px-2 py-1">
            {skill}
            <button
              type="button"
              onClick={() => handleRemoveSkill(skill)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No skills added yet. Add some skills to showcase your expertise.
          </p>
        )}
      </div>

      <div className="flex justify-between pt-4">
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
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isLastStep ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default SkillsStep;
