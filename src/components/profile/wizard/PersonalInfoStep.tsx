import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileFormData } from '@/types/profile';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';
import { User, Upload } from 'lucide-react';
import { WizardStepProps } from './ProfileWizard'; // Import WizardStepProps

// Update component to accept WizardStepProps
const PersonalInfoStep: React.FC<WizardStepProps> = ({ onNext }) => {
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: profile?.fullName || '',
      username: profile?.username || '',
      email: profile?.email || '',
      bio: profile?.bio || '',
      phone: profile?.phone || '' // Keep phone in form, just not sent to DB yet
    }
  });

  useEffect(() => {
    if (profile) {
      setValue('fullName', profile.fullName);
      setValue('username', profile.username);
      setValue('email', profile.email);
      setValue('bio', profile.bio || '');
      setValue('phone', profile.phone || '');
      setPreviewImage(profile.avatarUrl);
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      console.log("PersonalInfoStep onSubmit data:", data);
      
      await updateProfile(data);
      
      let avatarUpdated = false;
      if (data.avatarFile && data.avatarFile instanceof File) {
        const newAvatarUrl = await uploadAvatar(data.avatarFile);
        if (newAvatarUrl) {
          avatarUpdated = true;
        }
      }
      
      toast.success('Personal information updated successfully!');
      if (onNext) { // Call onNext if defined
        onNext();
      }
    } catch (error: any) {
      console.error('Error updating profile in PersonalInfoStep:', error);
      toast.error(`Failed to update personal information: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue('avatarFile', file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-background">
            <AvatarImage src={previewImage || ''} alt="Profile" />
            <AvatarFallback className="bg-primary text-3xl">
              <User size={36} />
            </AvatarFallback>
          </Avatar>
          
          <Button 
            type="button" 
            variant="secondary" 
            size="icon"
            className="absolute bottom-0 right-0 rounded-full h-10 w-10"
            onClick={triggerFileInput}
          >
            <Upload size={16} />
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            {...register('fullName', { required: 'Full name is required' })}
            autoComplete="name"
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            {...register('username', { 
              required: 'Username is required',
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores'
              }
            })}
            autoComplete="username"
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">About Me</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="Write a short bio..."
          className="min-h-[120px]"
        />
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button 
          type="submit" 
          className="w-full md:w-auto"
          disabled={isSubmitting || !profile} // Disable if profile not loaded
        >
          {isSubmitting ? 'Saving...' : 'Save & Next'}
        </Button>
      </div>
    </form>
  );
};

export default PersonalInfoStep;
