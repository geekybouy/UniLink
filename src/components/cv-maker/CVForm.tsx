
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { CVData } from "@/types/cv";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { EducationSection } from "./EducationSection";
import { WorkExperienceSection } from "./WorkExperienceSection";
import { ProjectsSection } from "./ProjectsSection";
import { SkillsAndCertificationsSection } from "./SkillsAndCertificationsSection";

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <PersonalInfoSection register={register} />
      <EducationSection register={register} watch={watch} setValue={setValue} />
      <WorkExperienceSection register={register} watch={watch} setValue={setValue} />
      <ProjectsSection register={register} watch={watch} setValue={setValue} />
      <SkillsAndCertificationsSection register={register} />
      <Button type="submit" className="w-full">Generate CV</Button>
    </form>
  );
}
