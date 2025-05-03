import React, { useEffect, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, refreshProfile, loading } = useProfile();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        await refreshProfile();
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [refreshProfile]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome!</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading profile..."
                  : `Here's a snapshot of your account.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 w-1/2 bg-muted rounded-md mb-2"></div>
                  <div className="h-3 w-1/4 bg-muted rounded-md"></div>
                </div>
              ) : user && profile ? (
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={profile.avatarUrl || undefined} />
                    <AvatarFallback>{getInitials(profile.fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold">{profile.fullName}</h2>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Failed to load profile information.
                </p>
              )}
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <UpcomingEvents />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>My Connections</CardTitle>
                  <CardDescription>
                    See who you're connected to and manage your network.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You have {Math.floor(Math.random() * 50)} connections.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/network">View My Network</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your profile, privacy, and notification settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="profile">
                  <AccordionTrigger>Profile Settings</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Update your profile information, bio, and avatar.
                    </p>
                    <Button asChild variant="secondary" className="mt-2">
                      <Link to="/profile">Edit Profile</Link>
                    </Button>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="privacy">
                  <AccordionTrigger>Privacy Settings</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Control who can see your information and activity.
                    </p>
                    <Button asChild variant="secondary" className="mt-2">
                      <Link to="/privacy-settings">Manage Privacy</Link>
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
