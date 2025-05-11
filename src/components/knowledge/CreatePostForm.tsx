
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useKnowledge } from '@/contexts/KnowledgeContext';
import { ContentType, PostFormData } from '@/types/knowledge';
import { toast } from 'sonner';
import { ContentTypeSelector } from './form/ContentTypeSelector';
import { TagSelector } from './form/TagSelector';
import { FileUploader } from './form/FileUploader';
import { LinkInput } from './form/LinkInput';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export default function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const { createPost, createTag, tags } = useKnowledge();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [contentType, setContentType] = useState<ContentType>('article');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PostFormData>();

  const handleCreateTag = async (tagName: string) => {
    return await createTag(tagName);
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

      <ContentTypeSelector 
        contentType={contentType}
        onContentTypeChange={(value) => setContentType(value)}
      />

      {contentType === 'link' && (
        <LinkInput 
          register={register}
          errors={errors}
          contentType={contentType}
        />
      )}

      {(contentType === 'file' || contentType === 'image') && (
        <FileUploader
          contentType={contentType}
          selectedFile={selectedFile}
          onFileChange={(file) => setSelectedFile(file)}
        />
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
        <TagSelector
          tags={tags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          onCreateTag={handleCreateTag}
        />
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
