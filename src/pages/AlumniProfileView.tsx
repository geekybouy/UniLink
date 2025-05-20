
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";

const AlumniProfileView = () => {
  const { profile, loading, refreshProfile } = useProfile();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!profile || !profile.is_profile_complete)) {
      navigate("/profile");
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    // Try refreshing profile on mount for extra safety
    refreshProfile().catch(() => setError("Failed to load profile data"));
  }, [refreshProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
        <span className="ml-3 text-lg text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Profile</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile || !profile.is_profile_complete) {
    // This will automatically redirect, but as a fallback:
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top summary */}
      <div className="bg-primary text-primary-foreground py-8 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-6 px-4">
          <Avatar className="h-24 w-24 ring-2 ring-white bg-white">
            <AvatarImage src={profile.profile_image_url || ""} />
            <AvatarFallback className="bg-primary text-xl text-white">
              {profile.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-bold font-playfair">{profile.name}</h2>
            <p className="text-md text-primary-foreground/80 mt-1">@{profile.username}</p>
            <div className="mt-2 text-primary-foreground/90">
              <span className="block">{profile.email}</span>
              <span className="block">{profile.phone_number || <span className="italic">No phone number provided.</span>}</span>
            </div>
            <div className="mt-2 text-primary-foreground/70 max-w-md">
              {profile.bio || <span className="italic">No bio provided.</span>}
            </div>
            <div className="mt-2 text-primary-foreground/70 max-w-md">
              <span>{profile.location || <span className="italic">Location not specified.</span>}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </Button>
              <Button variant="secondary" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 mt-8">
        <Card className="p-4 sm:p-6 max-w-2xl mx-auto mb-4 shadow-soft rounded-lg">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-xl tracking-tight">Profile Details</CardTitle>
            <CardDescription>
              View your account info and update as needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-0">
            <div>
              <span className="font-medium">Full Name:</span> {profile.name}
            </div>
            <div>
              <span className="font-medium">Username:</span> @{profile.username}
            </div>
            <div>
              <span className="font-medium">Email:</span> {profile.email}
            </div>
            <div>
              <span className="font-medium">Phone Number:</span> {profile.phone_number || "N/A"}
            </div>
            <div>
              <span className="font-medium">Location:</span> {profile.location || "N/A"}
            </div>
            <div>
              <span className="font-medium">Bio:</span> {profile.bio || "N/A"}
            </div>
            {/* SOCIAL LINKS */}
            <div>
              <span className="font-medium">Social Links:</span>
              <ShowUserSocialLinks userId={profile.id} />
            </div>
          </CardContent>
        </Card>
        {/* Tabs for additional info */}
        <Tabs defaultValue="activity" className="w-full max-w-2xl mx-auto mt-6 bg-white rounded-lg shadow-md">
          <TabsList className="grid grid-cols-3 w-full mb-2">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
            <div className="py-4">
              <span className="text-muted-foreground">Activity feed coming soon...</span>
            </div>
          </TabsContent>
          <TabsContent value="network">
            <div className="py-4">
              <span className="text-muted-foreground">Your network will appear here.</span>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="py-4">
              <span className="text-muted-foreground">Profile and privacy settings coming soon.</span>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AlumniProfileView;
