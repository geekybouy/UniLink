
import React from "react";

interface PersonalDetailsSectionProps {
  profile: any;
  safe: (val: any, fallback?: string) => string;
}

const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({ profile, safe }) => (
  <div>
    <h4 className="text-lg font-semibold mb-1">Personal Details</h4>
    <p><span className="font-medium">Name:</span> {safe(profile.fullName)}</p>
    <p><span className="font-medium">Email:</span> {safe(profile.email)}</p>
    <p><span className="font-medium">Username:</span> {safe(profile.username)}</p>
    <p><span className="font-medium">Phone:</span> {safe(profile.phone)}</p>
    <p><span className="font-medium">Location:</span> {safe(profile.location)}</p>
  </div>
);

export default PersonalDetailsSection;
