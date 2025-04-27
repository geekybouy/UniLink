
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { CVData } from "@/types/cv";

interface EducationSectionProps {
  register: UseFormRegister<CVData>;
  watch: UseFormWatch<CVData>;
  setValue: UseFormSetValue<CVData>;
}

export function EducationSection({ register, watch, setValue }: EducationSectionProps) {
  const addEducation = () => {
    const education = watch("education");
    setValue("education", [...education, { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Education</h3>
        <Button type="button" variant="outline" size="sm" onClick={addEducation}>
          <Plus className="mr-2 h-4 w-4" /> Add Education
        </Button>
      </div>
      {watch("education").map((_, index) => (
        <div key={index} className="grid gap-4 md:grid-cols-2 border p-4 rounded-lg">
          <div>
            <Label>Institution</Label>
            <Input {...register(`education.${index}.institution`)} placeholder="University Name" />
          </div>
          <div>
            <Label>Degree</Label>
            <Input {...register(`education.${index}.degree`)} placeholder="Bachelor's" />
          </div>
          <div>
            <Label>Field of Study</Label>
            <Input {...register(`education.${index}.fieldOfStudy`)} placeholder="Computer Science" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start Date</Label>
              <Input {...register(`education.${index}.startDate`)} type="month" />
            </div>
            <div>
              <Label>End Date</Label>
              <Input {...register(`education.${index}.endDate`)} type="month" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
