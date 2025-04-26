
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const CompleteProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    batch_year: '',
    course: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Convert batch_year to number if it's not empty
      const batchYearValue = formData.batch_year ? parseInt(formData.batch_year) : null;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: formData.bio,
          location: formData.location,
          batch_year: batchYearValue,
          course: formData.course,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <h2 className="text-2xl font-playfair text-center text-primary">Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              name="bio"
              placeholder="Tell us about yourself"
              value={formData.bio}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <Input
              name="location"
              placeholder="Your location"
              value={formData.location}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <Input
              name="batch_year"
              type="number"
              placeholder="Graduation Year"
              value={formData.batch_year}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <Input
              name="course"
              placeholder="Your course"
              value={formData.course}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : 'Complete Profile'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CompleteProfile;
