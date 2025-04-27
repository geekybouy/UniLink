
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { CVData } from "@/types/cv";

export default function CVForm({ onSubmit }: { onSubmit: (data: CVData) => void }) {
  const { register, handleSubmit, setValue, watch } = useForm<CVData>({
    defaultValues: {
      education: [{ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" }],
      workExperience: [{ company: "", position: "", startDate: "", endDate: "", description: [""] }],
      projects: [{ name: "", description: "", technologies: [] }],
      skills: [],
      certifications: [],
    },
  });

  const addEducation = () => {
    const education = watch("education");
    setValue("education", [...education, { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" }]);
  };

  const addWorkExperience = () => {
    const experience = watch("workExperience");
    setValue("workExperience", [...experience, { company: "", position: "", startDate: "", endDate: "", description: [""] }]);
  };

  const addProject = () => {
    const projects = watch("projects");
    setValue("projects", [...projects, { name: "", description: "", technologies: [] }]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input {...register("fullName")} id="fullName" placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input {...register("email")} id="email" type="email" placeholder="john@example.com" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input {...register("phone")} id="phone" placeholder="+1 234 567 890" />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input {...register("linkedin")} id="linkedin" placeholder="linkedin.com/in/johndoe" />
          </div>
        </div>
      </div>

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

      <Button type="submit" className="w-full">Generate CV</Button>
    </form>
  );
}
