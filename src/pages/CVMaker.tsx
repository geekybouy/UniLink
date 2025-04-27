
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CVForm from "@/components/cv-maker/CVForm";
import { CVData } from "@/types/cv";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

export default function CVMaker() {
  const [cvData, setCVData] = useState<CVData | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: CVData) => {
    if (!user) {
      toast.error("Please sign in to create a CV");
      return;
    }

    // Process the form data
    const processedData = {
      ...data,
      skills: typeof data.skills === "string" ? 
        data.skills.split(",").map(s => s.trim()) : 
        data.skills,
      certifications: typeof data.certifications === "string" ? 
        data.certifications.split("\n").filter(c => c.trim()) : 
        data.certifications,
    };

    try {
      const { error } = await supabase
        .from('cvs')
        .insert({
          user_id: user.id,
          cv_data: processedData as unknown as Json,
          template_used: "default" // You can make this dynamic when adding multiple templates
        });

      if (error) throw error;

      setCVData(processedData);
      toast.success("CV created successfully!");
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error("Failed to save CV");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">AI CV Maker</h1>
        <div className="max-w-4xl mx-auto">
          <CVForm onSubmit={handleSubmit} />
          {cvData && (
            <div className="mt-8">
              {/* CV preview will be implemented here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
