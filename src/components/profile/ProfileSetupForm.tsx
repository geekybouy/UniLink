import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileFormData {
  full_name: string;
  username: string;
  bio: string;
  university_name: string;
  graduation_year: string;
  branch: string;
  location: string;
  registration_number: string;
  avatar?: FileList;
}

export default function ProfileSetupForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>();

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from(
    { length: 21 }, 
    (_, i) => (currentYear - 10 + i).toString()
  );

  const handleImageUpload = async (file: File) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('No user found');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.data.user.id}/${fileName}`;

    const uploadResult = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
      
    if (uploadResult.error) throw uploadResult.error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('No user found');

      let avatarUrl = null;
      if (data.avatar?.[0]) {
        avatarUrl = await handleImageUpload(data.avatar[0]);
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          username: data.username,
          bio: data.bio,
          university_name: data.university_name,
          graduation_year: parseInt(data.graduation_year),
          branch: data.branch,
          location: data.location,
          registration_number: data.registration_number,
          avatar_url: avatarUrl,
          is_profile_complete: true,
        } as any)
        .eq('user_id', user.data.user.id);

      if (updateError) throw updateError;

      toast.success('Profile setup complete!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectGraduationYear = (value: string) => {
    setValue('graduation_year', value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="avatar">Profile Picture (Optional)</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          {...register('avatar')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          {...register('full_name', { required: 'Full name is required' })}
        />
        {errors.full_name && (
          <p className="text-sm text-red-500">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username *</Label>
        <Input
          id="username"
          {...register('username', { required: 'Username is required' })}
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          {...register('bio')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="university_name">University Name *</Label>
        <Input
          id="university_name"
          {...register('university_name', { required: 'University name is required' })}
        />
        {errors.university_name && (
          <p className="text-sm text-red-500">{errors.university_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="graduation_year">Graduation Year *</Label>
        <Select onValueChange={handleSelectGraduationYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {graduationYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.graduation_year && (
          <p className="text-sm text-red-500">{errors.graduation_year.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="branch">Branch *</Label>
        <Input
          id="branch"
          {...register('branch', { required: 'Branch is required' })}
        />
        {errors.branch && (
          <p className="text-sm text-red-500">{errors.branch.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          {...register('location', { required: 'Location is required' })}
        />
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="registration_number">Registration Number *</Label>
        <Input
          id="registration_number"
          {...register('registration_number', { required: 'Registration number is required' })}
        />
        {errors.registration_number && (
          <p className="text-sm text-red-500">{errors.registration_number.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Setting up...' : 'Complete Profile Setup'}
      </Button>
    </form>
  );
}
