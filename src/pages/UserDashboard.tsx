import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, ProfileProvider } from "@/contexts/ProfileContext";

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
    // Always refresh real profile (cache is fallback only)
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

  // Data validation helpers
  const safe = (val: any, fallback: string = "Not specified") =>
    val === null || val === undefined || val === "" ? fallback : val;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">My Profile</CardTitle>
          <CardDescription>
            Last updated: {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "Unknown"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {/* Personal Details */}
            <div>
              <h4 className="text-lg font-semibold mb-1">Personal Details</h4>
              <p><span className="font-medium">Name:</span> {safe(profile.fullName)}</p>
              <p><span className="font-medium">Email:</span> {safe(profile.email)}</p>
              <p><span className="font-medium">Username:</span> {safe(profile.username)}</p>
              <p><span className="font-medium">Phone:</span> {safe(profile.phone)}</p>
              <p><span className="font-medium">Location:</span> {safe(profile.location)}</p>
            </div>
            <div className="my-4 border-t border-border" />
            {/* Education */}
            <div>
              <h4 className="text-lg font-semibold mb-1">Education</h4>
              {Array.isArray(profile.education) && profile.education.length > 0 ? (
                profile.education.map((edu, idx) => (
                  <div key={edu.id ?? idx} className="mb-2">
                    <p className="font-medium">{safe(edu.university)}, {safe(edu.degree)} in {safe(edu.field)}</p>
                    <p className="text-sm text-muted-foreground">
                      {safe(edu.startYear)} –{" "}
                      {edu.isCurrentlyStudying ? "Present" : safe(edu.endYear)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No education records found.</p>
              )}
            </div>
            <div className="my-4 border-t border-border" />
            {/* Experience */}
            <div>
              <h4 className="text-lg font-semibold mb-1">Work Experience</h4>
              {Array.isArray(profile.workExperience) && profile.workExperience.length > 0 ? (
                profile.workExperience.map((exp, idx) => (
                  <div key={exp.id ?? idx} className="mb-2">
                    <p className="font-medium">{safe(exp.position)} at {safe(exp.company)}</p>
                    <p className="text-sm text-muted-foreground">
                      {safe(exp.startDate)} – {exp.isCurrentlyWorking ? "Present" : safe(exp.endDate)}
                    </p>
                    <p className="text-xs">{safe(exp.description)}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No work experience records found.</p>
              )}
            </div>
            <div className="my-4 border-t border-border" />
            {/* Skills */}
            <div>
              <h4 className="text-lg font-semibold mb-1">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <span key={skill.id ?? idx} className="inline-block bg-accent text-accent-foreground px-2 py-1 rounded">
                      {safe(skill.name)}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">No skills added.</span>
                )}
              </div>
            </div>
            <div className="my-4 border-t border-border" />
            {/* Social Links */}
            <div>
              <h4 className="text-lg font-semibold mb-1">Social Links</h4>
              <div className="flex flex-col gap-1">
                {Array.isArray(profile.socialLinks) && profile.socialLinks.length > 0 ? (
                  profile.socialLinks.map((link, idx) => (
                    <a
                      key={link.id ?? idx}
                      href={safe(link.url, "#")}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {safe(link.platform)}: {safe(link.url)}
                    </a>
                  ))
                ) : (
                  <span className="text-muted-foreground">No social links available.</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center">
            {/* Change variant from "primary" to "default" */}
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
