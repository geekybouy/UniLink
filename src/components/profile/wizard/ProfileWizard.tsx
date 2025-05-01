
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';
import PersonalInfoStep from './PersonalInfoStep';
import EducationStep from './EducationStep';
import WorkExperienceStep from './WorkExperienceStep';
import SkillsStep from './SkillsStep';
import LocationStep from './LocationStep';
import SocialLinksStep from './SocialLinksStep';

const steps = [
  'personal',
  'education',
  'work',
  'skills',
  'location',
  'social'
];

const ProfileWizard = () => {
  const navigate = useNavigate();
  const { profile, getProfileCompletion } = useProfile();
  const [currentStep, setCurrentStep] = useState('personal');
  
  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      handleComplete();
    }
  };
  
  const handlePrevious = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };
  
  const handleComplete = () => {
    toast.success('Profile setup completed!');
    navigate('/alumni/' + profile?.userId);
  };

  const completion = getProfileCompletion();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground mb-4">
            Fill in your details to help others find and connect with you
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile completion</span>
              <span>{completion}%</span>
            </div>
            <Progress value={completion} className="h-2" />
          </div>
        </div>

        <Tabs value={currentStep} onValueChange={setCurrentStep} className="space-y-6">
          <TabsList className="w-full flex overflow-x-auto scrollbar-hide justify-start sm:justify-center p-0 h-auto bg-transparent border-b border-border space-x-2">
            {steps.map((step) => (
              <TabsTrigger 
                key={step} 
                value={step} 
                className="flex-shrink-0 capitalize border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-2 py-1"
              >
                {step}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="personal">
            <PersonalInfoStep />
          </TabsContent>
          
          <TabsContent value="education">
            <EducationStep />
          </TabsContent>
          
          <TabsContent value="work">
            <WorkExperienceStep />
          </TabsContent>
          
          <TabsContent value="skills">
            <SkillsStep />
          </TabsContent>
          
          <TabsContent value="location">
            <LocationStep />
          </TabsContent>
          
          <TabsContent value="social">
            <SocialLinksStep />
          </TabsContent>

          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentStep === steps[0]}
            >
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps[steps.length - 1] ? 'Complete' : 'Next'}
            </Button>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProfileWizard;
