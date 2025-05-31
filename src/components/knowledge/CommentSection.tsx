
import React, { useState, useEffect } from 'react';
import { useKnowledge } from '@/contexts/KnowledgeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/knowledge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Send, Trash2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { fetchCommentsByPostId, addComment, deleteComment } = useKnowledge();
  const { user } = useAuth();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    loadComments();
  }, [postId]);
  
  const loadComments = async () => {
    setIsLoading(true);
    const fetchedComments = await fetchCommentsByPostId(postId);
    setComments(fetchedComments);
    setIsLoading(false);
  };
  
  const handleAddComment = async () => {
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const comment = await addComment(postId, newComment.trim());
      if (comment) {
        setComments(prevComments => [comment, ...prevComments]);
        setNewComment('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      setComments(prevComments => prevComments.filter(c => c.id !== commentId));
    }
  };
  
  const canPostComment = user && newComment.trim().length > 0;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Comments</h3>
      
      {/* Comment form */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder={user ? "Write a comment..." : "Log in to comment"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!user}
              className="resize-none"
              rows={3}
            />
            
            <div className="flex justify-end mt-2">
              <Button 
                onClick={handleAddComment}
                disabled={!canPostComment || isSubmitting}
                size="sm"
                className="flex items-center gap-1"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="h-3 w-3 mr-1" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map(comment => (
            <Card key={comment.id} className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comment.user?.avatar_url || undefined} />
                  <AvatarFallback>
                    {(comment.user?.full_name || '?').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {comment.user?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    
                    {user && user.id === comment.user_id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              Delete Comment
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your comment.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  
                  <div className="mt-2 text-sm">
                    {comment.content}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
