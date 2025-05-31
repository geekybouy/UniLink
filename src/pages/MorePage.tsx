import { Link } from 'react-router-dom';
import { Shield, BookOpen, UserCog, User, Settings, FileText, Bot, Users, Briefcase, Calendar, Network } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const MorePage = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <MainLayout hideFooter>
      <div className="container mx-auto px-4 py-6 animate-fade-in font-sans bg-background">
        <h1 className="text-2xl font-bold mb-6 text-foreground font-playfair">Menu</h1>
        
        {/* User Profile Card */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.profile_image_url || ''} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h2 className="text-lg font-semibold dark:text-white">{profile?.name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Link 
                to="/profile" 
                className="text-primary text-sm font-medium hover:underline mt-1 inline-block"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
        
        {/* Sections */}
        <div className="space-y-8">
          {/* Account & Profile */}
          <MenuSection title="Account & Profile">
            <MenuItem 
              to="/profile"
              title="My Profile"
              icon={User}
              description="View and edit your profile"
            />
            <MenuItem 
              to="/privacy-settings"
              title="Privacy Settings"
              icon={Shield}
              description="Manage account privacy and preferences"
            />
            <MenuItem 
              to="/settings"
              title="Settings & Preferences"
              icon={Settings}
              description="Customize your app experience"
            />
          </MenuSection>
          
          {/* Academic & Career */}
          <MenuSection title="Academic & Career">
            <MenuItem 
              to="/knowledge"
              title="Knowledge"
              icon={BookOpen}
              description="Resource center and tutorials"
            />
            <MenuItem 
              to="/credentials"
              title="Credentials"
              icon={FileText}
              description="View and share your achievements"
            />
            <MenuItem 
              to="/my-applications"
              title="My Applications"
              icon={Briefcase}
              description="Track your job applications"
            />
            <MenuItem 
              to="/ai-cv-maker"
              title="AI CV Maker"
              icon={Bot}
              description="Create a professional resume"
            />
          </MenuSection>

          {/* Tools & Features */}
          <MenuSection title="Tools & Features">
            <MenuItem 
              to="/developer"
              title="Community Developer"
              icon={Users}
              description="Development tools and features"
            />
            <MenuItem 
              to="/jobs"
              title="Jobs"
              icon={Briefcase}
              description="Job board and new opportunities"
            />
            <MenuItem 
              to="/events"
              title="Events"
              icon={Calendar}
              description="Explore alumni and campus events"
            />
            <MenuItem 
              to="/network"
              title="Network"
              icon={Network}
              description="Manage your professional network"
            />
          </MenuSection>
        </div>
        
        {/* Sign Out Button */}
        <div className="mt-10">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

type MenuSectionProps = {
  title: string;
  children: React.ReactNode;
};
const MenuSection = ({ title, children }: MenuSectionProps) => (
  <div>
    <h3 className="font-semibold mb-2 text-foreground text-lg">{title}</h3>
    <div className="grid gap-3">{children}</div>
  </div>
);

type MenuItemProps = {
  to: string;
  title: string;
  icon: React.ElementType;
  description: string;
};
const MenuItem = ({ to, title, icon: Icon, description }: MenuItemProps) => (
  <Link 
    to={to}
    className="flex items-center p-3 rounded-lg bg-muted/30 hover:bg-accent transition shadow-sm group"
  >
    <span className="bg-primary/10 p-2 rounded-full mr-4">
      <Icon className="h-6 w-6 text-primary" />
    </span>
    <span>
      <div className="font-medium text-base text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </span>
  </Link>
);

export default MorePage;
