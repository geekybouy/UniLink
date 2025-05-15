
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PersonalInfoStep from './PersonalInfoStep';
import EducationStep from './EducationStep';
import WorkExperienceStep from './WorkExperienceStep';
import SkillsStep from './SkillsStep';
import SocialLinksStep from './SocialLinksStep';
import LocationStep from './LocationStep';
import { useProfile } from '@/contexts/ProfileContext';

interface ProfileWizardProps {
  onComplete?: () => void;
}

const ProfileWizard: React.FC<ProfileWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { profile, loading } = useProfile();
  
  const steps = [
    { id: 'personal-info', title: 'Personal Information', component: PersonalInfoStep },
    { id: 'education', title: 'Education', component: EducationStep },
    { id: 'work-experience', title: 'Work Experience', component: WorkExperienceStep },
    { id: 'skills', title: 'Skills', component: SkillsStep },
    { id: 'social-links', title: 'Social Links', component: SocialLinksStep },
    { id: 'location', title: 'Location', component: LocationStep },
  ];
  
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (onComplete) onComplete();
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const CurrentStepComponent = steps[currentStep].component;
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
        </div>
        
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        <CurrentStepComponent
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
        />
      </Card>
    </div>
  );
};

export default ProfileWizard;
