
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { toast } from "sonner";

interface AboutSectionProps {
  isEditing: boolean;
}

const AboutSection = ({ isEditing }: AboutSectionProps) => {
  const { profile, updateProfile } = useProfile();
  const [bio, setBio] = useState(profile?.bio || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      await updateProfile({ bio });
      toast.success("Bio updated successfully");
    } catch (error) {
      console.error("Error updating bio:", error);
      toast.error("Failed to update bio");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">About</h3>
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-[100px]"
            placeholder="Tell us about yourself..."
          />
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground">
          {profile?.bio || "No bio information available. Click Edit Profile to add your bio."}
        </p>
      )}
    </div>
  );
};

export default AboutSection;
