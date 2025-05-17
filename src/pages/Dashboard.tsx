
import React, { useEffect, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { ShieldCheck } from "lucide-react";
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

// ProgressBar for loading state
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full mt-2">
    <div className="relative h-2 bg-muted rounded overflow-hidden">
      <div
        className="absolute left-0 top-0 h-2 bg-primary transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="text-right text-xs text-muted-foreground mt-1">{progress}% loaded</div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { profile, refreshProfile, loading } = useProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState(false);

  // NEW: simulated loading progress
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulate incrementing progress bar during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          // progress increases incrementally but slows as it approaches 90%
          if (prev < 90) return prev + Math.floor(Math.random() * 6) + 5;  // increment 5~10%
          return prev;
        });
      }, 250);
    } else {
      setLoadingProgress(100);
      setTimeout(() => setLoadingProgress(0), 600); // reset after brief full bar
    }

    return () => interval && clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      setProfileLoadError(false);
      try {
        await refreshProfile();
      } catch (error) {
        setProfileLoadError(true);
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [refreshProfile]);

  useEffect(() => {
    const checkAdminRole = async () => {
      const admin = await hasRole('admin');
      setIsAdmin(admin);
    };

    checkAdminRole();
  }, [hasRole]);

  // Enhanced error state
  if (!isLoading && (!profile || profileLoadError)) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="p-8 shadow-lg max-w-lg w-full animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-destructive">
                Profile Not Found or Failed to Load
              </CardTitle>
              <CardDescription className="mt-2 text-muted-foreground">
                We couldn't load your profile.<br />
                This may be because you just created your account, data not yet available, or a network issue.<br />
                <span className="text-xs block mt-2 text-destructive/70">
                  (Error details are in console – check your internet connection or try again.)
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Button
                variant="destructive"
                className="mt-4"
                onClick={async () => {
                  setIsLoading(true);
                  setProfileLoadError(false);
                  try {
                    await refreshProfile();
                    toast.success("Retrying profile loading. If this fails, contact support.", { duration: 4000 });
                  } catch (e) {
                    setProfileLoadError(true);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                Retry Profile Setup
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {isLoading && (
          <div className="mb-6 p-8 w-full flex flex-col items-center justify-center">
            <Spinner size="lg" variant="primary" />
            <ProgressBar progress={Math.min(loadingProgress, 99)} />
            <div className="mt-3 text-muted-foreground text-base font-medium">
              Loading your profile and dashboard&hellip;
            </div>
          </div>
        )}

        {!isLoading && isAdmin && (
          <div className="mb-6 p-4 border rounded-lg bg-accent/10">
            <div className="flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-lg font-medium">Admin Access</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              You have administrator privileges. Access the admin dashboard to manage users, content, and system settings.
            </p>
            <Button asChild variant="default" size="sm" className="mt-2">
              <a href="/admin/dashboard">Go to Admin Dashboard</a>
            </Button>
          </div>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome!</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading profile..."
                  : profile
                  ? "Here's a snapshot of your account."
                  : "Profile data unavailable."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <Spinner size="md" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded-md"></div>
                    <div className="h-3 w-24 bg-muted rounded-md"></div>
                  </div>
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
