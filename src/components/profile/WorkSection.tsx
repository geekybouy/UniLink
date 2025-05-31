
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WorkSectionProps {
  isEditing: boolean;
}

const WorkSection = ({ isEditing }: WorkSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        {isEditing && (
          <Button variant="outline" size="sm">Add Experience</Button>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-semibold">Senior Software Engineer</h4>
            <p className="text-sm text-muted-foreground">Google</p>
            <p className="text-sm text-muted-foreground">2020 - Present</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkSection;
