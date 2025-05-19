
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const AlumniProfileView = () => {
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!profile || !profile.isProfileComplete)) {
      // If somehow not complete, reroute to profile wizard
      navigate("/profile");
    }
  }, [profile, loading, navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-lg text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top summary */}
      <div className="bg-primary text-primary-foreground py-8 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-6 px-4">
          <Avatar className="h-24 w-24 ring-2 ring-white bg-white">
            <AvatarImage src={profile.avatarUrl || ""} />
            <AvatarFallback className="bg-primary text-xl text-white">{profile.fullName?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-bold font-playfair">{profile.fullName}</h2>
            <p className="text-md text-primary-foreground/80 mt-1">{profile.email}</p>
            <div className="mt-2 text-primary-foreground/70 max-w-md">
              {profile.bio || <span className="italic">No bio provided.</span>}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 mt-8">
        <Card className="p-4 sm:p-6 max-w-2xl mx-auto mb-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-xl tracking-tight">
              Achievements & Info
            </CardTitle>
            <CardDescription>
              View your key milestones and academic/professional info.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            <div>
              <span className="font-medium">University:</span>{" "}
              {profile.university || "N/A"}
            </div>
            <div>
              <span className="font-medium">Graduation Year:</span>{" "}
              {profile.graduationYear || "N/A"}
            </div>
            <div>
              <span className="font-medium">Branch:</span>{" "}
              {profile.branch || "N/A"}
            </div>
            <div>
              <span className="font-medium">Location:</span>{" "}
              {profile.location || "N/A"}
            </div>
            {/* Add more fields if desired */}
          </CardContent>
        </Card>

        {/* Tabs: Activity, Network, Settings */}
        <Tabs defaultValue="activity" className="w-full max-w-2xl mx-auto mt-6 bg-white rounded-lg shadow-md">
          <TabsList className="grid grid-cols-3 w-full mb-2">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <div className="py-4">
              {/* Placeholder for recent posts, event participation, etc. */}
              <span className="text-muted-foreground">Activity feed coming soon...</span>
            </div>
          </TabsContent>
          <TabsContent value="network">
            <div className="py-4">
              {/* Placeholder for contacts/connections, friendship status etc. */}
              <span className="text-muted-foreground">Your network will appear here.</span>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="py-4">
              {/* Settings UI placeholder */}
              <span className="text-muted-foreground">Profile and privacy settings coming soon.</span>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AlumniProfileView;
