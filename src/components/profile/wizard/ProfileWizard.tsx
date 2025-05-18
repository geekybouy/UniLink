import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardHeader, CardContent, CardTitle, CardDescription
import PersonalInfoStep from './PersonalInfoStep';
import EducationStep from './EducationStep';
import WorkExperienceStep from './WorkExperienceStep';
import SkillsStep from './SkillsStep';
import SocialLinksStep from './SocialLinksStep';
import LocationStep from './LocationStep';
import { useProfile } from '@/contexts/ProfileContext';
import { Progress } from "@/components/ui/progress"; // Using Progress component
import { toast } from "sonner";

interface ProfileWizardProps {
  onComplete?: () => void;
}

// Define a common props type for all step components
export interface WizardStepProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// Update the component type to include WizardStepProps
type StepComponentType = React.FC<WizardStepProps>;

const ProfileWizard: React.FC<ProfileWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { profile, loading: profileLoading, updateProfile } = useProfile(); // pull in updateProfile
  
  const steps: { id: string; title: string; component: StepComponentType }[] = [
    { id: 'personal-info', title: 'Personal Information', component: PersonalInfoStep as StepComponentType },
    { id: 'education', title: 'Education', component: EducationStep as StepComponentType },
    { id: 'work-experience', title: 'Work Experience', component: WorkExperienceStep as StepComponentType },
    { id: 'skills', title: 'Skills', component: SkillsStep as StepComponentType },
    { id: 'social-links', title: 'Social Links', component: SocialLinksStep as StepComponentType },
    { id: 'location', title: 'Location', component: LocationStep as StepComponentType },
  ];
  
  const goToNextStep = async () => {  // Make this async
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On final step, complete the profile
      await markProfileComplete();
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const CurrentStepComponent = steps[currentStep].component;
  const isFinalStep = currentStep === steps.length - 1;
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const markProfileComplete = async () => {
    try {
      await updateProfile({ isProfileComplete: true }); // Call the context update
      toast.success("Profile completed successfully!");
      if (onComplete) onComplete();
    } catch (e: any) {
      toast.error("Error while finishing profile: " + (e?.message || e));
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p>Loading profile data...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-xl border-border/50">
        <CardHeader className="text-center p-0 mb-4">
          <CardTitle className="text-3xl font-bold text-primary">Complete Your Profile</CardTitle>
          <CardDescription className="text-muted-foreground">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </CardDescription>
        </CardHeader>
        
        <Progress value={progressPercentage} className="w-full h-3" />
        
        <CardContent className="p-0 mt-6">
          <CurrentStepComponent
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === steps.length - 1}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileWizard;
