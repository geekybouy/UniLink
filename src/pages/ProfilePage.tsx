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
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view your profile');
      navigate('/login');
      return;
    }
    
    setIsLoading(false);
  }, [user, navigate]);

  const handleEditProfile = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = async () => {
    setShowWizard(false);
    toast.success("Profile updated successfully!");
    // Consider calling a refreshProfile function from context if available
    // For a more robust solution, context should handle re-fetching.
    // window.location.reload(); // This is generally not ideal
  };

  if (isLoading) {
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
        <ProfileWizard onComplete={handleWizardComplete} />
      </ProfileProvider>
    );
  }

  return (
    <ProfileProvider>
      <ProfileContent 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEditProfile={handleEditProfile}
      />
    </ProfileProvider>
  );
};

// Separate component to use the ProfileContext
const ProfileContent = ({ 
  activeTab, 
  setActiveTab,
  onEditProfile
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onEditProfile: () => void;
}) => {
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!profileLoading && profile && !profile.isProfileComplete) {
      const wizardJustCompleted = sessionStorage.getItem('wizardCompleted');
      if (!wizardJustCompleted) {
        toast.info("Please complete your profile to access all features.");
        onEditProfile(); 
      } else {
        sessionStorage.removeItem('wizardCompleted');
      }
    }
  }, [profile, profileLoading, onEditProfile]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
        <span className="ml-3 text-lg text-muted-foreground">Loading profile data...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background">
        <Card className="p-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-destructive">Profile Not Found</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your profile information could not be loaded. This might be a temporary issue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onEditProfile} variant="destructive" className="mt-4">
              Create or Retry Profile Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm shadow-sm z-50 border-b border-border/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-playfair text-primary font-bold">UniLink</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEditProfile}
            className="border-primary text-primary hover:bg-primary/10"
          >
            Edit Profile
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-24">
        <ProfileHeader 
          isEditing={isEditing} 
          setIsEditing={setIsEditing}
          isOwnProfile={true}
        />
        
        <div className="mt-8">
          <Tabs 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 h-auto bg-muted rounded-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
                Overview
              </TabsTrigger>
              <TabsTrigger value="education" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
                Education
              </TabsTrigger>
              <TabsTrigger value="experience" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
                Experience
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md">
                Contact
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[calc(100vh-20rem)] mt-6">
              <TabsContent value="overview" className="space-y-6">
                <AboutSection isEditing={isEditing} />
                <Card className="p-4 sm:p-6 shadow-sm border-border/50">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-semibold text-foreground">Profile Highlights</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">University</h4>
                      <p className="text-sm text-foreground">{profile.university || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Current Position</h4>
                      <p className="text-sm text-foreground">
                        {profile.job_title && profile.current_company 
                          ? `${profile.job_title} at ${profile.current_company}`
                          : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                      <p className="text-sm text-foreground">{profile.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Member Since</h4>
                      <p className="text-sm text-foreground">
                        {profile.createdAt 
                          ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })
                          : 'Unknown'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="education" className="space-y-6">
                <EducationSection isEditing={isEditing} />
              </TabsContent>
              
              <TabsContent value="experience" className="space-y-6">
                <WorkSection isEditing={isEditing} />
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-6">
                <ContactInfo isEditing={isEditing} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
