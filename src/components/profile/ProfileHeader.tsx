
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useProfile } from '@/contexts/ProfileContext';

interface ProfileHeaderProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  isOwnProfile?: boolean;
}

const ProfileHeader = ({
  isEditing,
  setIsEditing,
  isOwnProfile = true,
}: ProfileHeaderProps) => {
  const { profile } = useProfile();

  if (!profile) {
    return (
      <div className="flex flex-col items-center text-center animate-pulse">
        <div className="h-32 w-32 rounded-full bg-muted"></div>
        <div className="mt-4 h-8 w-48 bg-muted rounded"></div>
        <div className="mt-2 h-4 w-32 bg-muted rounded"></div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <Avatar className="h-32 w-32">
        <AvatarImage src={profile.profile_image_url || ''} alt={profile.name} />
        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
          {profile.name ? getInitials(profile.name) : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="mt-4 flex items-center gap-2">
        <h2 className="text-2xl font-bold">{profile.name}</h2>
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            aria-label={isEditing ? "Cancel editing" : "Edit profile"}
            className="h-8 w-8 rounded-full"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-muted-foreground">
        @{profile.username}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        {profile.email}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        {profile.location || "Location not specified."}
      </p>
      {profile.bio && (
        <p className="text-sm text-muted-foreground mt-1">
          {profile.bio}
        </p>
      )}
    </div>
  );
};

export default ProfileHeader;
