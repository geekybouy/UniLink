import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensure the events storage bucket exists and is properly configured
 */
export const ensureEventsBucketExists = async () => {
  try {
    // Check if the bucket already exists
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const eventsBucket = existingBuckets?.find(bucket => bucket.name === 'events');
    
    // If the bucket doesn't exist, create it
    if (!eventsBucket) {
      await supabase.storage.createBucket('events', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      // Set CORS policy for the bucket
      await supabase.storage.from('events').updateBucketCORS({
        allowedOrigins: ['*'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['*'],
        maxAgeSeconds: 3600,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to ensure events bucket exists:', error);
    return false;
  }
};

/**
 * Get initials from a name
 */
export const getInitials = (name: string) => {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
