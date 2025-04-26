
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EducationSectionProps {
  isEditing: boolean;
}

const EducationSection = ({ isEditing }: EducationSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Education</h3>
        {isEditing && (
          <Button variant="outline" size="sm">Add Education</Button>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-semibold">Stanford University</h4>
            <p className="text-sm text-muted-foreground">
              Bachelor of Science in Computer Science
            </p>
            <p className="text-sm text-muted-foreground">2016 - 2020</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationSection;
