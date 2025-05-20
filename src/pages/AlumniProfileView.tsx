
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import ShowUserSocialLinks from "@/components/profile/ShowUserSocialLinks";

const FIELD_PLACEHOLDER = <span className="italic text-muted-foreground">Not provided</span>;

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
    // Always try to refresh the profile for latest data
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
    // This will automatically redirect to profile wizard
    return null;
  }

  // Utility to provide fallbacks for fields
  const safeDisplay = (value: any) => {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && !isNaN(value)) return value;
    return FIELD_PLACEHOLDER;
  };

  // These two are not in UserProfile so will be undefined
  const branch = (profile as any).branch ?? null;
  const gradYear = (profile as any).graduation_year ?? null;
  const company = (profile as any).current_company ?? null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-0 shadow-md rounded-lg overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground flex flex-col items-center py-10">
            <Avatar className="h-28 w-28 ring-4 ring-white bg-white">
              <AvatarImage src={profile.profile_image_url ?? ""} />
              <AvatarFallback className="bg-primary text-2xl text-white">
                {profile.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-3xl font-bold font-playfair mt-4">{safeDisplay(profile.name)}</h2>
            <span className="text-md text-primary-foreground/80 mt-1">@{safeDisplay(profile.username)}</span>
            <div className="mt-2 flex flex-col items-center gap-1">
              <span>
                <span className="font-medium">Email: </span>
                {safeDisplay(profile.email)}
              </span>
              <span>
                <span className="font-medium">Phone: </span>
                {safeDisplay(profile.phone_number)}
              </span>
              <span>
                <span className="font-medium">Location: </span>
                {safeDisplay(profile.location)}
              </span>
            </div>
            <div className="mt-2 text-primary-foreground/90 max-w-md text-center">
              <span className="font-medium block">Bio:</span>
              <span>{safeDisplay(profile.bio)}</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <span className="font-medium">Branch: </span>
                {safeDisplay(branch)}
              </div>
              <div>
                <span className="font-medium">Graduation Year: </span>
                {gradYear ? gradYear : FIELD_PLACEHOLDER}
              </div>
              <div>
                <span className="font-medium">Current Company: </span>
                {safeDisplay(company)}
              </div>
              <div>
                <span className="font-medium">Social Links: </span>
                <ShowUserSocialLinks userId={profile.id} />
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlumniProfileView;
