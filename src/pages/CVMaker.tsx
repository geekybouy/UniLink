
import { useState } from "react";
import CVForm from "@/components/cv-maker/CVForm";
import { CVData } from "@/types/cv";

export default function CVMaker() {
  const [cvData, setCVData] = useState<CVData | null>(null);

  const handleSubmit = (data: CVData) => {
    // Process the form data
    const processedData = {
      ...data,
      skills: typeof data.skills === "string" ? data.skills.split(",").map(s => s.trim()) : data.skills,
      certifications: typeof data.certifications === "string" ? 
        data.certifications.split("\n").filter(c => c.trim()) : 
        data.certifications,
    };
    setCVData(processedData);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">AI CV Maker</h1>
        <div className="max-w-4xl mx-auto">
          <CVForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
