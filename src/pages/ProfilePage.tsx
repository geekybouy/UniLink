
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // If no user is authenticated, redirect to login
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

  const handleWizardComplete = () => {
    setShowWizard(false);
    // Force refresh profile data
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading profile...</span>
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
        isEditing={isEditing} 
        setIsEditing={setIsEditing} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEditProfile={handleEditProfile}
      />
    </ProfileProvider>
  );
};

// Separate component to use the ProfileContext
const ProfileContent = ({ 
  isEditing, 
  setIsEditing, 
  activeTab, 
  setActiveTab,
  onEditProfile
}) => {
  const { profile, loading } = useProfile();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading profile data...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
        <p className="text-muted-foreground mb-6">Your profile information could not be loaded.</p>
        <Button onClick={onEditProfile}>Create Profile</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-playfair text-primary font-bold">UniLink</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEditProfile}
          >
            Edit Profile
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-20">
        <ProfileHeader 
          isEditing={isEditing} 
          setIsEditing={setIsEditing}
          isOwnProfile={true}
        />
        
        <div className="mt-8">
          <Tabs 
            defaultValue="overview" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full flex overflow-x-auto scrollbar-hide justify-start p-0 h-auto bg-transparent border-b space-x-2">
              <TabsTrigger value="overview" className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="education" className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1">
                Education
              </TabsTrigger>
              <TabsTrigger value="experience" className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1">
                Experience
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1">
                Contact
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[calc(100vh-16rem)] mt-4">
              <TabsContent value="overview" className="space-y-6">
                <AboutSection isEditing={isEditing} />
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Profile Highlights</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Education</h4>
                      <p className="text-sm">{profile.university || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Current Position</h4>
                      <p className="text-sm">
                        {profile.job_title && profile.current_company 
                          ? `${profile.job_title} at ${profile.current_company}`
                          : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                      <p className="text-sm">{profile.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Member Since</h4>
                      <p className="text-sm">
                        {profile.createdAt 
                          ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
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
