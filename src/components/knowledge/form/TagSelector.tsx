
import React, { useState } from 'react';
import { Tag } from '@/types/knowledge';
import { PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TagSelectorProps {
  tags: Tag[];
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  onCreateTag: (tagName: string) => Promise<Tag | null>;
}

export const TagSelector = ({ 
  tags, 
  selectedTags, 
  setSelectedTags, 
  onCreateTag 
}: TagSelectorProps) => {
  const [newTag, setNewTag] = useState('');

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
      const tagResult = await onCreateTag(newTag.trim());
      if (tagResult) {
        setSelectedTags([...selectedTags, tagResult.id]);
        setNewTag('');
      }
    }
  };

  return (
    <>
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
    </>
  );
};
