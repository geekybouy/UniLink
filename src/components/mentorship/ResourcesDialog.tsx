
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MentorshipResource, ResourceType } from '@/types/mentorship';
import { ResourceForm } from './ResourceForm';
import { ResourceList } from './ResourceList';

interface ResourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: MentorshipResource[];
  relationshipId: string;
  onShareResource: (resourceData: Omit<MentorshipResource, 'id' | 'shared_by' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

export function ResourcesDialog({
  open,
  onOpenChange,
  resources,
  relationshipId,
  onShareResource,
  isLoading,
}: ResourcesDialogProps) {
  const [activeTab, setActiveTab] = useState('view');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mentorship Resources</DialogTitle>
          <DialogDescription>
            Share and access resources for this mentorship relationship
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">View Resources</TabsTrigger>
            <TabsTrigger value="share">Share Resource</TabsTrigger>
          </TabsList>
          <TabsContent value="view" className="mt-4 space-y-4">
            <ResourceList resources={resources} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="share" className="mt-4">
            <ResourceForm 
              relationshipId={relationshipId}
              onSubmit={async (data) => {
                await onShareResource(data);
                setActiveTab('view');
              }}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
