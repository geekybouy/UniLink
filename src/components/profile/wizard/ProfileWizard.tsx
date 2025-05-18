
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import PersonalInfoStep from './PersonalInfoStep';
import EducationStep from './EducationStep';
import WorkExperienceStep from './WorkExperienceStep';
import SkillsStep from './SkillsStep';
import SocialLinksStep from './SocialLinksStep';
import LocationStep from './LocationStep';
import { useProfile } from '@/contexts/ProfileContext';
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from "@/components/ErrorBoundary"; // <-- FIX: Import custom ErrorBoundary

interface ProfileWizardProps {
  onComplete?: () => void;
}

export interface WizardStepProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  onStepSave?: (data: any) => Promise<void>;
}

type StepComponentType = React.FC<WizardStepProps>;

// REMOVE the WizardErrorBoundary component since it is not needed when using ErrorBoundary

const ProfileWizard: React.FC<ProfileWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const steps = [
    { id: 'personal-info', title: 'Personal Information', component: PersonalInfoStep as StepComponentType },
    { id: 'education', title: 'Education', component: EducationStep as StepComponentType },
    { id: 'work-experience', title: 'Work Experience', component: WorkExperienceStep as StepComponentType },
    { id: 'skills', title: 'Skills', component: SkillsStep as StepComponentType },
    { id: 'social-links', title: 'Social Links', component: SocialLinksStep as StepComponentType },
    { id: 'location', title: 'Location', component: LocationStep as StepComponentType },
  ];

  const [stepSubmitting, setStepSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleStepSave = async (data: any) => {
    setStepSubmitting(true);
    try {
      if (!data || typeof data !== "object") {
        toast.error("Form data missing, please fill in all required fields.");
        return Promise.reject(new Error("No data to save"));
      }
      await updateProfile(data);
    } catch (e: any) {
      if (e?.message?.includes("Failed to fetch")) {
        toast.error("Could not connect to the server. Check your network and login status.");
      } else if (e?.message?.includes("User not authenticated")) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Error saving step data: " + (e?.message || e));
      }
      setStepSubmitting(false);
      throw e;
    }
    setStepSubmitting(false);
  };

  const goToNextStep = async () => {
    if (stepSubmitting) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // last step: finish and redirect
      try {
        setStepSubmitting(true);
        await updateProfile({ isProfileComplete: true });
        toast.success("Profile completed successfully!");
        if (onComplete) onComplete();
        navigate('/profile'); // <<< IMMEDIATE REDIRECT AFTER FINISH!
      } catch (e: any) {
        toast.error("Could not complete profile: " + (e?.message || e));
        setStepSubmitting(false);
        return;
      } finally {
        setStepSubmitting(false);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p>Loading profile data...</p>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // FIX: Wrap main wizard with the correct ErrorBoundary component
  return (
    <ErrorBoundary>
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
              onStepSave={handleStepSave}
            />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default ProfileWizard;

