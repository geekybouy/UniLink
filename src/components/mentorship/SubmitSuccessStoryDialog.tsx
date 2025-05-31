
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMentorship } from '@/contexts/MentorshipContext';
import { SuccessStoryForm } from './SuccessStoryForm';
import { Spinner } from '@/components/ui/spinner';

interface SubmitSuccessStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relationshipId: string;
}

export function SubmitSuccessStoryDialog({
  open,
  onOpenChange,
  relationshipId
}: SubmitSuccessStoryDialogProps) {
  const { submitSuccessStory } = useMentorship();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await submitSuccessStory({
        relationship_id: relationshipId,
        title: data.title,
        story: data.story
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting success story:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Your Success Story</DialogTitle>
          <DialogDescription>
            Share your mentorship experience to inspire others
          </DialogDescription>
        </DialogHeader>
        
        <SuccessStoryForm
          relationshipId={relationshipId}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
