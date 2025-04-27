
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { CVData } from "@/types/cv";

interface ProjectsSectionProps {
  register: UseFormRegister<CVData>;
  watch: UseFormWatch<CVData>;
  setValue: UseFormSetValue<CVData>;
}

export function ProjectsSection({ register, watch, setValue }: ProjectsSectionProps) {
  const addProject = () => {
    const projects = watch("projects");
    setValue("projects", [...projects, { name: "", description: "", technologies: [] }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Projects</h3>
        <Button type="button" variant="outline" size="sm" onClick={addProject}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>
      {watch("projects").map((_, index) => (
        <div key={index} className="grid gap-4 border p-4 rounded-lg">
          <div>
            <Label>Project Name</Label>
            <Input {...register(`projects.${index}.name`)} placeholder="Project Name" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              {...register(`projects.${index}.description`)} 
              placeholder="Describe your project"
              rows={3}
            />
          </div>
          <div>
            <Label>Technologies</Label>
            <Input 
              {...register(`projects.${index}.technologies`)} 
              placeholder="React, Node.js, TypeScript"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
