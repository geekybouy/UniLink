
import { Tag } from '@/types/knowledge';
import * as tagService from '@/services/knowledge/tagService';

export const useTagOperations = (userId?: string, setTags?: React.Dispatch<React.SetStateAction<Tag[]>>) => {
  const createTag = async (name: string): Promise<Tag | null> => {
    const result = await tagService.createTag(name, userId);
    if (result && setTags) {
      // Update tags
      setTags(prevTags => [...prevTags, result]);
    }
    return result;
  };

  return {
    createTag,
  };
};
