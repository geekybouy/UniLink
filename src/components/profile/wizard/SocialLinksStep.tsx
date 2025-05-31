
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useSocialLinks, SocialLink } from "./useSocialLinks";
import { toast } from "sonner";
import { WizardStepProps } from "./ProfileWizard";

const platformSuggestions = [
  "LinkedIn",
  "Twitter",
  "Facebook",
  "Instagram",
];

const SocialLinksStep: React.FC<WizardStepProps> = ({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  onStepSave,
}) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const userId = user?.id;
  const { links, setLinks, saveLinks, loading } = useSocialLinks(userId);

  // Used for local form state before saving
  const [linkForms, setLinkForms] = useState<SocialLink[]>([{ platform: "", url: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form value with loaded links (only on load)
  useEffect(() => {
    if (links && links.length > 0) setLinkForms(links);
  }, [links]);

  const handleLinkChange = (index: number, field: "platform" | "url", value: string) => {
    const updated = [...linkForms];
    updated[index][field] = value;
    setLinkForms(updated);
  };

  const addSocialLink = () => {
    setLinkForms((forms) => [
      ...forms,
      { platform: "", url: "" }
    ]);
  };

  const removeSocialLink = (index: number) => {
    if (linkForms.length === 1) {
      toast.error("Add at least one link or leave empty.");
      return;
    }
    setLinkForms((forms) => forms.filter((_, i) => i !== index));
  };

  // Save links to Supabase on submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User not authenticated.");
      return;
    }
    setIsSubmitting(true);
    try {
      await saveLinks(linkForms);
      toast.success("Social links saved!");
      if (onStepSave) await onStepSave({}); // Call parent if needed
      onNext();
    } catch (e: any) {
      toast.error("Failed to save social links.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium mb-4">Social Links</h3>
      <p className="text-muted-foreground mb-2">
        Add links to your social media profiles. Only those you fill will be saved.
      </p>
      <div className="flex flex-col gap-4">
        {linkForms.map((link, idx) => (
          <div key={idx} className="flex gap-4 items-center border rounded-md p-3">
            <div className="flex-1">
              <Label>
                Platform
                <Input
                  list="platform-suggestions"
                  value={link.platform}
                  onChange={(e) =>
                    handleLinkChange(idx, "platform", e.target.value)
                  }
                  placeholder="E.g., LinkedIn"
                  className="mt-1"
                  autoComplete="off"
                />
                <datalist id="platform-suggestions">
                  {platformSuggestions.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </Label>
            </div>
            <div className="flex-1">
              <Label>
                URL
                <Input
                  value={link.url}
                  onChange={(e) =>
                    handleLinkChange(idx, "url", e.target.value)
                  }
                  placeholder="https://example.com/yourprofile"
                  className="mt-1"
                  autoComplete="off"
                />
              </Label>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="ml-1"
              onClick={() => removeSocialLink(idx)}
              aria-label="Remove link"
              disabled={linkForms.length === 1}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <Button type="button" variant="outline" onClick={addSocialLink}>
          <Plus className="h-4 w-4 mr-2" /> Add Social Link
        </Button>
      </div>
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep || isSubmitting || loading}
        >
          Previous
        </Button>
        <Button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting
            ? "Saving…"
            : isLastStep
            ? "Complete"
            : "Next"}
        </Button>
      </div>
    </form>
  );
};

export default SocialLinksStep;
