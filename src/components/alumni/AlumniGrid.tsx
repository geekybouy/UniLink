
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/types/profile";

export interface AlumniGridProps {
  alumni: UserProfile[];
  onMessage?: (profileId: string) => void;
  onViewProfile: (profileId: string) => void;
  onConnect?: (profileId: string) => void;
}

const AlumniGrid = ({
  alumni,
  onMessage,
  onViewProfile,
  onConnect,
}: AlumniGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {alumni.map((profile) => (
        <div
          key={profile.id}
          className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
        >
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={profile.profile_image_url || undefined} alt={profile.name} />
            <AvatarFallback>
              {(profile.name && profile.name[0]?.toUpperCase()) || "U"}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
          <p className="text-sm text-gray-500 mt-1">@{profile.username}</p>
          <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
          <p className="text-sm text-gray-500 mt-1">{profile.phone_number || "N/A"}</p>
          <p className="text-sm text-gray-500 mt-1">{profile.location || "N/A"}</p>
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-2 mb-2">{profile.bio}</p>
          )}
          <Button className="mt-4 w-full" onClick={() => onViewProfile(profile.id)}>
            View Profile
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AlumniGrid;
