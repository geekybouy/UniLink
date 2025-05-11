
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { PostFormData } from '@/types/knowledge';

interface LinkInputProps {
  register: UseFormRegister<PostFormData>;
  errors: FieldErrors<PostFormData>;
  contentType: string;
}

export const LinkInput = ({ register, errors, contentType }: LinkInputProps) => {
  return (
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
  );
};
