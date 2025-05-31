
import React from 'react';
import { ContentType } from '@/types/knowledge';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ContentTypeSelectorProps {
  contentType: ContentType;
  onContentTypeChange: (value: ContentType) => void;
}

export const ContentTypeSelector = ({
  contentType,
  onContentTypeChange
}: ContentTypeSelectorProps) => {
  return (
    <div>
      <Label htmlFor="content-type">Content Type</Label>
      <Select
        value={contentType}
        onValueChange={(value) => onContentTypeChange(value as ContentType)}
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
  );
};
