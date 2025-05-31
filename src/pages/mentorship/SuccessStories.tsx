
import React, { useState, useEffect } from 'react';
import { useMentorship } from '@/contexts/MentorshipContext';
import MainLayout from '@/layouts/MainLayout';
import { SuccessStoryCard } from '@/components/mentorship/SuccessStoryCard';
import { SuccessStory } from '@/types/mentorship';
import { Spinner } from '@/components/ui/spinner';

export function SuccessStories() {
  const { getSuccessStories } = useMentorship();
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadStories = async () => {
      setIsLoading(true);
      try {
        const storiesData = await getSuccessStories();
        setStories(storiesData);
      } catch (error) {
        console.error('Error loading success stories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStories();
  }, [getSuccessStories]);
  
  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto py-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4">Success Stories</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Read about the positive impact mentorship has had on our community members.
            These stories showcase the power of knowledge sharing and guidance.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-card">
            <p className="text-muted-foreground">No success stories have been shared yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <SuccessStoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                mentorName="Mentor Name" // Replace with actual names from relationships
                menteeName="Mentee Name"
                createdAt={story.created_at}
                story={story.story}
                rating={5}
                isFeatured={story.is_featured}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default SuccessStories;
