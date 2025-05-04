
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useKnowledge } from '@/contexts/KnowledgeContext';
import { PostFormData, ContentType } from '@/types/knowledge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, FileText, Link2, Image, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define form schema
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().optional(),
  content_type: z.enum(['article', 'link', 'file', 'image']),
  link_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
});

interface CreatePostFormProps {
  onSuccess?: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onSuccess }) => {
  const { createPost, createTag, tags } = useKnowledge();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      content_type: 'article',
      link_url: '',
      tags: [],
    },
  });
  
  const contentType = form.watch('content_type') as ContentType;
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Validate file attachment if needed
      if ((contentType === 'file' || contentType === 'image') && !selectedFile) {
        toast.error(`Please select a ${contentType} to upload`);
        setIsSubmitting(false);
        return;
      }
      
      // Create post data
      const postData: PostFormData = {
        title: data.title,
        content: data.content || '',
        content_type: data.content_type,
        link_url: data.content_type === 'link' ? data.link_url : undefined,
        tags: selectedTags,
      };
      
      const result = await createPost(postData, selectedFile || undefined);
      
      if (result) {
        toast.success('Post created successfully');
        form.reset();
        setSelectedFile(null);
        setSelectedTags([]);
        if (onSuccess) onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };
  
  const handleTagSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Please enter a tag name');
      return;
    }
    
    const newTag = await createTag(newTagName.trim());
    if (newTag) {
      setSelectedTags([...selectedTags, newTag.id]);
      setNewTagName('');
      setNewTagDialogOpen(false);
    }
  };
  
  const displayContentTypeFields = () => {
    switch (contentType) {
      case 'article':
        return (
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Write your article..." 
                    {...field} 
                    className="min-h-[200px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'link':
        return (
          <FormField
            control={form.control}
            name="link_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com" 
                    {...field} 
                    type="url"
                  />
                </FormControl>
                <FormDescription>
                  Please enter the full URL including http:// or https://
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'file':
      case 'image':
        return (
          <FormItem>
            <FormLabel>Upload {contentType}</FormLabel>
            <FormControl>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  onChange={handleFileChange}
                  accept={contentType === 'image' ? "image/*" : undefined}
                  className="flex-1"
                />
              </div>
            </FormControl>
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedFile.name}
              </div>
            )}
            <FormMessage />
          </FormItem>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Content Type Selection */}
          <FormField
            control={form.control}
            name="content_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                  >
                    <FormItem className="flex flex-col items-center space-y-2 rounded-md border p-4 hover:bg-muted/50 [&:has([data-state=checked])]:bg-muted/50">
                      <FormControl>
                        <RadioGroupItem value="article" className="sr-only" />
                      </FormControl>
                      <FileText className="h-5 w-5" />
                      <FormLabel className="text-center">Article</FormLabel>
                    </FormItem>
                    
                    <FormItem className="flex flex-col items-center space-y-2 rounded-md border p-4 hover:bg-muted/50 [&:has([data-state=checked])]:bg-muted/50">
                      <FormControl>
                        <RadioGroupItem value="link" className="sr-only" />
                      </FormControl>
                      <Link2 className="h-5 w-5" />
                      <FormLabel className="text-center">Link</FormLabel>
                    </FormItem>
                    
                    <FormItem className="flex flex-col items-center space-y-2 rounded-md border p-4 hover:bg-muted/50 [&:has([data-state=checked])]:bg-muted/50">
                      <FormControl>
                        <RadioGroupItem value="file" className="sr-only" />
                      </FormControl>
                      <File className="h-5 w-5" />
                      <FormLabel className="text-center">File</FormLabel>
                    </FormItem>
                    
                    <FormItem className="flex flex-col items-center space-y-2 rounded-md border p-4 hover:bg-muted/50 [&:has([data-state=checked])]:bg-muted/50">
                      <FormControl>
                        <RadioGroupItem value="image" className="sr-only" />
                      </FormControl>
                      <Image className="h-5 w-5" />
                      <FormLabel className="text-center">Image</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Post title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Dynamic content fields based on content type */}
          {displayContentTypeFields()}
          
          {/* Tags Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel>Tags</FormLabel>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setNewTagDialogOpen(true)}
                className="h-8 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> New Tag
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[50px] bg-background">
              {tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagSelect(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
              
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground p-1">No tags available. Create one!</p>
              )}
            </div>
            
            {selectedTags.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedTags.length} tag(s) selected
              </p>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Creating Post...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Publish Post
              </>
            )}
          </Button>
        </form>
      </Form>
      
      {/* New Tag Dialog */}
      <Dialog open={newTagDialogOpen} onOpenChange={setNewTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Enter a name for the new tag. Tags help categorize and find content.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewTagDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTag}
            >
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePostForm;
