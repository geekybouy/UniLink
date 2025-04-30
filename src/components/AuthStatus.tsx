
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export const AuthStatus = () => {
  const { user, firebaseUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }
  
  if (!user && !firebaseUser) {
    return <div className="text-sm text-gray-500">Not signed in</div>;
  }
  
  // Prefer Firebase user data as it has more info like photo URL
  const displayName = firebaseUser?.displayName || user?.user_metadata?.full_name || 'User';
  const email = firebaseUser?.email || user?.email || '';
  const photoURL = firebaseUser?.photoURL || user?.user_metadata?.avatar_url;
  const firstLetter = displayName.charAt(0).toUpperCase();
  
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={photoURL || undefined} alt={displayName} />
        <AvatarFallback>{firstLetter}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
    </div>
  );
};
