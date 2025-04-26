
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface ProfileHeaderProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

const ProfileHeader = ({ isEditing, setIsEditing }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      <Avatar className="h-32 w-32">
        <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" alt="John Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div className="mt-4 flex items-center gap-2">
        <h2 className="text-2xl font-bold">John Doe</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-muted-foreground">Class of 2020</p>
    </div>
  );
};

export default ProfileHeader;
