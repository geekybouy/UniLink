
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Shield,
  Star,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hasNewPostsSchema } from '@/services/knowledge/dbSchemaService';

interface ModToolbarProps {
  postId: string;
  isFeatured: boolean;
  onPostUpdated: () => void;
}

const ModToolbar: React.FC<ModToolbarProps> = ({ postId, isFeatured, onPostUpdated }) => {
  const [supportsFeatures, setSupportsFeatures] = useState<boolean>(false);
  
  useEffect(() => {
    // Check schema support on component mount
    const checkSchema = async () => {
      const hasNewSchema = await hasNewPostsSchema();
      setSupportsFeatures(hasNewSchema);
    };
    
    checkSchema();
  }, []);
  
  const toggleFeatured = async () => {
    if (!supportsFeatures) {
      toast.error('Feature not supported with current database schema');
      return;
    }
    
    try {
      // Use an explicit object with known properties to avoid TypeScript errors
      const { error } = await supabase
        .from('posts')
        .update({ is_featured: !isFeatured } as any)
        .eq('id', postId);

      if (error) throw error;
      
      toast.success(isFeatured ? 'Post removed from featured content' : 'Post added to featured content');
      onPostUpdated();
    } catch (error: any) {
      toast.error('Error updating post status: ' + error.message);
    }
  };
  
  const deletePost = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      toast.success('Post deleted successfully');
      onPostUpdated();
    } catch (error: any) {
      toast.error('Error deleting post: ' + error.message);
    }
  };
  
  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-muted">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Moderator Tools</h3>
      </div>
      
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={toggleFeatured}
          disabled={!supportsFeatures}
        >
          <Star className={`h-4 w-4 mr-2 ${isFeatured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          {isFeatured ? 'Remove from Featured' : 'Add to Featured'}
          {!supportsFeatures && ' (Needs schema update)'}
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Post
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                Delete Post
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the post
                and remove all associated comments and votes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={deletePost}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ModToolbar;
