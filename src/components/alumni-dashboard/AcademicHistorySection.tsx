
import React from "react";

interface AcademicHistorySectionProps {
  profile: any;
  safe: (val: any, fallback?: string) => string;
}

const AcademicHistorySection: React.FC<AcademicHistorySectionProps> = ({ profile, safe }) => (
  <div>
    <h4 className="text-lg font-semibold mb-1">Academic History</h4>
    {Array.isArray(profile.education) && profile.education.length > 0 ? (
      profile.education.map((edu, idx) => (
        <div key={edu.id ?? idx} className="mb-2">
          <p className="font-medium">{safe(edu.university)}, {safe(edu.degree)} in {safe(edu.field)}</p>
          <p className="text-sm text-muted-foreground">
            {safe(edu.startYear)} – {edu.isCurrentlyStudying ? "Present" : safe(edu.endYear)}
          </p>
        </div>
      ))
    ) : (
      <p className="text-muted-foreground">No academic records found.</p>
    )}
  </div>
);

export default AcademicHistorySection;
