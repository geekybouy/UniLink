
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface AboutSectionProps {
  isEditing: boolean;
}

const AboutSection = ({ isEditing }: AboutSectionProps) => {
  const [bio, setBio] = useState("Software Engineer passionate about creating impactful solutions. Graduate from Computer Science with focus on AI and Machine Learning.");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">About</h3>
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-[100px]"
          />
          <Button variant="default" size="sm">Save</Button>
        </div>
      ) : (
        <p className="text-muted-foreground">{bio}</p>
      )}
    </div>
  );
};

export default AboutSection;
