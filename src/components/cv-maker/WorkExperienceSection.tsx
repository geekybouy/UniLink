
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { CVData } from "@/types/cv";

interface WorkExperienceSectionProps {
  register: UseFormRegister<CVData>;
  watch: UseFormWatch<CVData>;
  setValue: UseFormSetValue<CVData>;
}

export function WorkExperienceSection({ register, watch, setValue }: WorkExperienceSectionProps) {
  const addWorkExperience = () => {
    const experience = watch("workExperience");
    setValue("workExperience", [...experience, { company: "", position: "", startDate: "", endDate: "", description: [""] }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Work Experience</h3>
        <Button type="button" variant="outline" size="sm" onClick={addWorkExperience}>
          <Plus className="mr-2 h-4 w-4" /> Add Experience
        </Button>
      </div>
      {watch("workExperience").map((_, index) => (
        <div key={index} className="grid gap-4 border p-4 rounded-lg">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Company</Label>
              <Input {...register(`workExperience.${index}.company`)} placeholder="Company Name" />
            </div>
            <div>
              <Label>Position</Label>
              <Input {...register(`workExperience.${index}.position`)} placeholder="Software Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start Date</Label>
              <Input {...register(`workExperience.${index}.startDate`)} type="month" />
            </div>
            <div>
              <Label>End Date</Label>
              <Input {...register(`workExperience.${index}.endDate`)} type="month" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              {...register(`workExperience.${index}.description`)} 
              placeholder="• List your achievements&#10;• Use bullet points for better readability"
              rows={4}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
