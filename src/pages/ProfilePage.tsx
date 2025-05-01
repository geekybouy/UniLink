
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AboutSection from '@/components/profile/AboutSection';
import EducationSection from '@/components/profile/EducationSection';
import WorkSection from '@/components/profile/WorkSection';
import ContactInfo from '@/components/profile/ContactInfo';
import BottomNav from '@/components/BottomNav';
import ProfileWizard from '@/components/profile/wizard/ProfileWizard';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const checkProfile = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Check if this is the user's own profile
        if (user?.id === id) {
          setIsOwnProfile(true);
          
          // Check if profile is complete
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_profile_complete')
            .eq('user_id', id)
            .single();
            
          if (profileError) throw profileError;
          
          if (!profileData.is_profile_complete) {
            setShowWizard(true);
          }
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkProfile();
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (!id) {
    navigate('/dashboard');
    return null;
  }

  if (showWizard) {
    return (
      <ProfileProvider>
        <ProfileWizard />
      </ProfileProvider>
    );
  }

  return (
    <ProfileProvider>
      <div className="min-h-screen bg-background pb-16">
        <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm shadow-sm z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-playfair text-primary font-bold">UniLink</h1>
            {isOwnProfile && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowWizard(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </nav>

        <main className="container mx-auto px-4 pt-20">
          <ProfileHeader 
            isEditing={isEditing} 
            setIsEditing={setIsEditing}
            isOwnProfile={isOwnProfile}
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
                        <p className="text-sm">Stanford University</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Current Position</h4>
                        <p className="text-sm">Senior Software Engineer at Google</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                        <p className="text-sm">San Francisco, CA</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Member Since</h4>
                        <p className="text-sm">January 2023</p>
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
    </ProfileProvider>
  );
};

export default ProfilePage;
