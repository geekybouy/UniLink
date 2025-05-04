
import { Link } from 'react-router-dom';
import { Shield, BookOpen, UserCog, User } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const MorePage = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">More Options</h1>
        
        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatarUrl || ''} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">{profile?.fullName || 'User'}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <Link 
                to="/profile" 
                className="text-primary text-sm font-medium hover:underline mt-1 inline-block"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
        
        {/* Menu Options */}
        <div className="grid gap-4">
          <LinkCard 
            to="/credential-wallet"
            title="Credentials Wallet"
            description="Access and share your academic credentials"
            icon={Shield}
          />
          
          <LinkCard 
            to="/cv-maker"
            title="CV Builder"
            description="Create and manage your professional resume"
            icon={BookOpen}
          />
          
          <LinkCard 
            to="/knowledge"
            title="Knowledge Hub"
            description="Access shared resources and discussions"
            icon={BookOpen}
          />
          
          <LinkCard 
            to="/my-applications"
            title="My Applications"
            description="Track your job applications"
            icon={User}
          />
          
          <LinkCard 
            to="/privacy-settings"
            title="Privacy Settings"
            description="Manage your account and privacy preferences"
            icon={UserCog}
          />
        </div>
        
        {/* Sign Out Button */}
        <div className="mt-8">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

type LinkCardProps = {
  to: string;
  title: string;
  description: string;
  icon: React.ElementType;
};

const LinkCard = ({ to, title, description, icon: Icon }: LinkCardProps) => {
  return (
    <Link 
      to={to}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center hover:shadow-md transition-shadow duration-200"
    >
      <div className="bg-primary/10 p-3 rounded-full">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="ml-4">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
};

export default MorePage;
