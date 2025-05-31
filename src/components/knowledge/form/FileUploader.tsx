
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FileUploaderProps {
  contentType: string;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
}

export const FileUploader = ({
  contentType,
  selectedFile,
  onFileChange
}: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
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
  );
};
