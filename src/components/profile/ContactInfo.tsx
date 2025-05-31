
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ContactInfoProps {
  isEditing: boolean;
}

const ContactInfo = ({ isEditing }: ContactInfoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>
      <Card>
        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue="john.doe@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">LinkedIn</label>
                <Input defaultValue="linkedin.com/in/johndoe" />
              </div>
              <Button>Save Changes</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">john.doe@example.com</p>
              </div>
              <div>
                <p className="text-sm font-medium">LinkedIn</p>
                <p className="text-sm text-muted-foreground">linkedin.com/in/johndoe</p>
              </div>
              <Button>Connect</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfo;
