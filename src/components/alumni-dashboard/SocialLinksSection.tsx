
import React from "react";

interface SocialLinksSectionProps {
  profile: any;
  safe: (val: any, fallback?: string) => string;
}

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({ profile, safe }) => (
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
);

export default SocialLinksSection;
