
import React, { useState } from 'react';
import { KnowledgeProvider } from '@/contexts/KnowledgeContext';
import MainLayout from '@/layouts/MainLayout';
import KnowledgeFeed from '@/components/knowledge/KnowledgeFeed';
import FeaturedContent from '@/components/knowledge/FeaturedContent';
import CreatePostForm from '@/components/knowledge/CreatePostForm';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Plus, BookOpen, Link, File, Image } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

const KnowledgeHub: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { user } = useAuth();
  
  return (
    <MainLayout>
      <KnowledgeProvider>
        <div className="container px-4 py-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-7 w-7" />
                Knowledge Hub
              </h1>
              <p className="text-muted-foreground mt-1">
                Discover, learn, and share valuable resources with the community
              </p>
            </div>
            
            {user && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                    <DialogDescription>
                      Share knowledge, resources, or files with the community
                    </DialogDescription>
                  </DialogHeader>
                  <CreatePostForm onSuccess={() => setCreateDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Feed */}
            <div className="lg:col-span-3">
              <KnowledgeFeed />
            </div>
            
            {/* Sidebar */}
            <aside className="space-y-6">
              <FeaturedContent />

              {/* About Section */}
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-medium mb-2">About Knowledge Hub</h3>
                <p className="text-sm text-muted-foreground">
                  A place for alumni and students to share and discover valuable resources, articles, 
                  and files that help with professional growth and learning.
                </p>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Content Types</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Articles and discussions
                    </li>
                    <li className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      External resources and links
                    </li>
                    <li className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      Documents and files
                    </li>
                    <li className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Images and visual content
                    </li>
                  </ul>
                </div>

                {!user && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium">Login to contribute</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sign in to share knowledge and interact with content
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </KnowledgeProvider>
    </MainLayout>
  );
};

export default KnowledgeHub;
