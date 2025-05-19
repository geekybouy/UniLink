import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileProvider, useProfile } from '@/contexts/ProfileContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AboutSection from '@/components/profile/AboutSection';
import EducationSection from '@/components/profile/EducationSection';
import WorkSection from '@/components/profile/WorkSection';
import ContactInfo from '@/components/profile/ContactInfo';
import BottomNav from '@/components/BottomNav';
import ProfileWizard from '@/components/profile/wizard/ProfileWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view your profile');
      navigate('/login');
      return;
    }
    setIsLoading(false);
  }, [user, navigate]);

  useEffect(() => {
    // If the profile data finishes loading, route to profile view or wizard accordingly
    if (!isLoading && !profileLoading) {
      if (profile && profile.isProfileComplete) {
        navigate('/profile/view');
      } else {
        setShowWizard(true);
      }
    }
  }, [isLoading, profileLoading, profile, navigate]);

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
        <span className="ml-3 text-lg text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  if (showWizard) {
    return (
      <ProfileProvider>
        <ProfileWizard 
          onComplete={() => navigate('/profile/view')} 
        />
      </ProfileProvider>
    );
  }

  // Should not be possible to reach this, since we navigate on profile loaded, but
  // fallback in case.
  return null;
};

export default ProfilePage;
