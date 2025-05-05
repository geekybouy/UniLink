
import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentorship } from '@/contexts/MentorshipContext';
import MainLayout from '@/layouts/MainLayout';
import { MentorWithProfile } from '@/types/mentorship';
import { Spinner } from '@/components/ui/spinner';

// Lazy load the form component to reduce initial bundle size
const RegisterMentorForm = React.lazy(() => 
  import('@/components/mentorship/RegisterMentorForm').then(module => ({ 
    default: module.RegisterMentorForm 
  }))
);

export function BecomeMentor() {
  const navigate = useNavigate();
  const { registerAsMentor } = useMentorship();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await registerAsMentor(data);
      navigate('/mentorship/dashboard');
    } catch (error) {
      console.error('Error registering as mentor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container max-w-3xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Become a Mentor</h1>
          <p className="text-muted-foreground">
            Share your expertise and help guide the next generation of professionals.
            Complete the form below to register as a mentor.
          </p>
        </div>
        
        <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
          <RegisterMentorForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </Suspense>
      </div>
    </MainLayout>
  );
}

export default BecomeMentor;
