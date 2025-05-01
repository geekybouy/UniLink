
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/integrations/supabase/client';

interface LocationFormData {
  location: string;
}

const LocationStep = () => {
  const { profile, updateProfile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LocationFormData>({
    defaultValues: {
      location: profile?.location || ''
    }
  });
  
  useEffect(() => {
    if (profile?.location) {
      setValue('location', profile.location);
    }
  }, [profile, setValue]);

  const onSubmit = async (data: LocationFormData) => {
    try {
      setIsSubmitting(true);
      
      await updateProfile({ location: data.location });
      
      toast.success('Location updated successfully');
    } catch (error: any) {
      toast.error('Failed to update location: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Location</h3>
        <p className="text-sm text-muted-foreground">
          Add your location to connect with alumni and peers near you
        </p>
      </div>
      
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">City/Region</Label>
            <Input
              id="location"
              {...register('location', { required: 'Location is required' })}
              placeholder="e.g., San Francisco, CA"
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            This information helps UniLink connect you with alumni and peers in your area
          </p>
        </div>
      </Card>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Location'}
      </Button>
    </form>
  );
};

export default LocationStep;
