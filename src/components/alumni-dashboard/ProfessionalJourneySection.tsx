
import React from "react";

interface ProfessionalJourneySectionProps {
  profile: any;
  safe: (val: any, fallback?: string) => string;
}

const ProfessionalJourneySection: React.FC<ProfessionalJourneySectionProps> = ({ profile, safe }) => (
  <div>
    <h4 className="text-lg font-semibold mb-1">Professional Journey</h4>
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
);

export default ProfessionalJourneySection;
