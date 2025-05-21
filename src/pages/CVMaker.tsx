
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CVForm from "@/components/cv-maker/CVForm";
import { CVData } from "@/types/cv";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function CVMaker() {
  const [cvData, setCVData] = useState<CVData | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: CVData) => {
    if (!user) {
      toast.error("Please sign in to create a CV");
      return;
    }
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
          template_used: "default"
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
    <ErrorBoundary>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">CV Maker</h1>
            <Button onClick={() => navigate('/ai-cv-maker')} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Try AI CV Maker
            </Button>
          </div>
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
    </ErrorBoundary>
  );
}
