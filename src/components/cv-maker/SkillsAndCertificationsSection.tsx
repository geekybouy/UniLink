
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister } from "react-hook-form";
import { CVData } from "@/types/cv";

interface SkillsAndCertificationsSectionProps {
  register: UseFormRegister<CVData>;
}

export function SkillsAndCertificationsSection({ register }: SkillsAndCertificationsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Skills & Certifications</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="skills">Skills (comma-separated)</Label>
          <Textarea 
            {...register("skills")} 
            id="skills"
            placeholder="React, TypeScript, Node.js, etc."
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="certifications">Certifications (one per line)</Label>
          <Textarea 
            {...register("certifications")} 
            id="certifications"
            placeholder="AWS Certified Developer&#10;Google Cloud Professional"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
