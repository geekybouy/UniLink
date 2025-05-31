
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  onSubmit: (data: { resume_url?: string; cover_letter?: string }) => Promise<void>;
}

const formSchema = z.object({
  cover_letter: z.string().min(20, "Cover letter must be at least 20 characters long"),
  resume: z.any().optional(),
});

export default function ApplicationForm({ isOpen, onClose, jobId, jobTitle, onSubmit }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cover_letter: "",
      resume: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const uploadResume = async (): Promise<string | undefined> => {
    if (!resumeFile) return undefined;
    
    setIsUploading(true);
    
    try {
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `resumes/${jobId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('jobs')
        .upload(filePath, resumeFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('jobs')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
      return undefined;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      let resumeUrl: string | undefined;
      
      if (resumeFile) {
        resumeUrl = await uploadResume();
        if (!resumeUrl) {
          toast.error('Failed to upload resume');
          setIsSubmitting(false);
          return;
        }
      }
      
      await onSubmit({
        resume_url: resumeUrl,
        cover_letter: values.cover_letter,
      });
      
      form.reset();
      setResumeFile(null);
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Fill out this application form to apply for this position. Upload your resume and provide a cover letter.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="resume">Resume (PDF, DOC, or DOCX)</Label>
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  disabled={isUploading}
                  className="w-full justify-start"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {resumeFile ? resumeFile.name : "Choose file"}
                    </>
                  )}
                </Button>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
              {resumeFile && (
                <p className="text-xs text-gray-500">
                  {resumeFile.name} ({Math.round(resumeFile.size / 1024)} KB)
                </p>
              )}
              {!resumeFile && (
                <p className="text-xs text-gray-500">
                  Upload your resume in PDF, DOC, or DOCX format (max 5MB)
                </p>
              )}
            </div>
            
            <FormField
              control={form.control}
              name="cover_letter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your cover letter here..."
                      className="h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
