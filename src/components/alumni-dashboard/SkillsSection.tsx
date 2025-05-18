
import React from "react";

interface SkillsSectionProps {
  profile: any;
  safe: (val: any, fallback?: string) => string;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ profile, safe }) => (
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
);

export default SkillsSection;
