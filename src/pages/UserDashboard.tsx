import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, ProfileProvider } from "@/contexts/ProfileContext";
import PersonalDetailsSection from "@/components/alumni-dashboard/PersonalDetailsSection";
import AcademicHistorySection from "@/components/alumni-dashboard/AcademicHistorySection";
import ProfessionalJourneySection from "@/components/alumni-dashboard/ProfessionalJourneySection";
import SkillsSection from "@/components/alumni-dashboard/SkillsSection";
import SocialLinksSection from "@/components/alumni-dashboard/SocialLinksSection";
import NetworkingSection from "@/components/alumni-dashboard/NetworkingSection";
import NotificationCenterSection from "@/components/alumni-dashboard/NotificationCenterSection";
import ExportProfileButton from "@/components/alumni-dashboard/ExportProfileButton";
import ProfileMetricsSection from "@/components/alumni-dashboard/ProfileMetricsSection";

const CACHE_KEY = "user-dashboard-profile";

// Helper to cache profile data in memory for quick nav (improves perf)
function getCachedProfile() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedProfile(profile: any) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore
  }
}

const ProfileSummary = ({ onEdit }: { onEdit: () => void }) => {
  const { profile, loading, refreshProfile } = useProfile();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      const cached = getCachedProfile();
      if (cached) {
        setCachedProfile(cached);
      }
    } else {
      setCachedProfile(profile);
    }
  }, [profile]);

  useEffect(() => {
    refreshProfile().catch((e) => setError("Failed to load profile data."));
  }, [refreshProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Spinner size="lg" />
        <span className="mt-2 text-muted-foreground">Loading your dashboard...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
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
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              No profile information was found. Please create or edit your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onEdit}>Edit Profile</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const safe = (val: any, fallback: string = "Not specified") =>
    val === null || val === undefined || val === "" ? fallback : val;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">My Alumni Dashboard</CardTitle>
          <CardDescription>
            Last updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "Unknown"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <PersonalDetailsSection profile={profile} safe={safe} />
            <div className="my-4 border-t border-border" />
            <AcademicHistorySection profile={profile} safe={safe} />
            <div className="my-4 border-t border-border" />
            <ProfessionalJourneySection profile={profile} safe={safe} />
            <div className="my-4 border-t border-border" />
            <SkillsSection profile={profile} safe={safe} />
            <div className="my-4 border-t border-border" />
            <SocialLinksSection profile={profile} safe={safe} />
            <div className="my-4 border-t border-border" />
            <NetworkingSection />
            <div className="my-4 border-t border-border" />
            <ProfileMetricsSection />
            <div className="my-4 border-t border-border" />
            <NotificationCenterSection />
            <div className="my-4 border-t border-border" />
            <ExportProfileButton profile={profile} />
          </div>
          <div className="mt-8 flex flex-col items-center">
            <Button onClick={onEdit} variant="default" className="w-full max-w-xs">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth(); // Change "loading" to "isLoading"
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return <>{children}</>;
};

const UserDashboardPage = () => {
  const navigate = useNavigate();

  const goToEditProfile = () => {
    navigate("/profile");
  };

  return (
    <RequireAuth>
      <ProfileProvider>
        <ProfileSummary onEdit={goToEditProfile} />
      </ProfileProvider>
    </RequireAuth>
  );
};

export default UserDashboardPage;
