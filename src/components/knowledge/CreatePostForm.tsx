
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useKnowledge } from '@/contexts/KnowledgeContext';
import { ContentType, PostFormData, Tag } from '@/types/knowledge';
import { toast } from 'sonner';
import { PlusCircle, X } from 'lucide-react';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export default function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const { createPost, createTag, tags } = useKnowledge();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [contentType, setContentType] = useState<ContentType>('article');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PostFormData>();

  const handleTagSelect = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const handleAddNewTag = async () => {
    if (newTag.trim() !== '') {
      const tagResult = await createTag(newTag.trim());
      if (tagResult) {
        setSelectedTags([...selectedTags, tagResult.id]);
        setNewTag('');
      }
    }
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      setIsSubmitting(true);
      data.content_type = contentType;
      data.tags = selectedTags;
      
      const result = await createPost(data, selectedFile || undefined);
      if (result) {
        toast.success('Post created successfully!');
        reset();
        setSelectedTags([]);
        setContentType('article');
        setSelectedFile(null);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Post title"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="content-type">Content Type</Label>
        <Select
          value={contentType}
          onValueChange={(value) => setContentType(value as ContentType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Content Type</SelectLabel>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="file">File</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {contentType === 'link' && (
        <div>
          <Label htmlFor="link_url">Link URL</Label>
          <Input 
            id="link_url"
            {...register('link_url', { 
              required: contentType === 'link' ? 'URL is required' : false,
              pattern: {
                value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                message: 'Please enter a valid URL'
              } 
            })}
            placeholder="https://example.com"
          />
          {errors.link_url && (
            <p className="text-sm text-red-500">{errors.link_url.message}</p>
          )}
        </div>
      )}

      {(contentType === 'file' || contentType === 'image') && (
        <div>
          <Label htmlFor="file">Upload {contentType}</Label>
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={triggerFileInput}
              className="w-full"
            >
              {selectedFile ? selectedFile.name : `Choose ${contentType}`}
            </Button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept={contentType === 'image' ? 'image/*' : undefined}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea 
          id="content"
          {...register('content', { required: 'Content is required' })}
          placeholder="Write your post content here..."
          className="min-h-[200px]"
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? (
              <span 
                key={tag.id}
                className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center"
              >
                {tag.name}
                <button 
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1 text-primary/70 hover:text-primary"
                >
                  <X size={14} />
                </button>
              </span>
            ) : null;
          })}
        </div>
        <div className="flex gap-2 mt-2">
          <Select onValueChange={handleTagSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Available Tags</SelectLabel>
                {tags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
                {tags.filter(tag => !selectedTags.includes(tag.id)).length === 0 && (
                  <SelectItem value="no-tags-available" disabled>
                    No more tags available
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 mt-2">
          <Input 
            placeholder="Add new tag" 
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
          <Button 
            type="button" 
            variant="outline"
            onClick={handleAddNewTag}
            disabled={newTag.trim() === ''}
          >
            <PlusCircle size={16} className="mr-2" />
            Add
          </Button>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Creating...' : 'Create Post'}
      </Button>
    </form>
  );
}
