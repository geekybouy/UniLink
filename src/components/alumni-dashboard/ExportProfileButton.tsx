
import React from "react";
import { Button } from "@/components/ui/button";

interface ExportProfileButtonProps {
  profile: any;
}

const ExportProfileButton: React.FC<ExportProfileButtonProps> = ({ profile }) => {
  const handleExport = () => {
    const json = JSON.stringify(profile, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alumni_profile.json";
    a.click();
  };

  return (
    <Button variant="outline" onClick={handleExport} className="w-full max-w-xs mt-4">
      Download Profile Data
    </Button>
  );
};

export default ExportProfileButton;
