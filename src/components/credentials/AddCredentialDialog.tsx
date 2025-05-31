import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, 
  DialogContent,
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Credential } from '@/types/credentials';

interface AddCredentialDialogProps {
  open: boolean;
  onClose: () => void;
  onAddCredential: (credential: Credential) => void;
  credentialType: 'academic' | 'certification' | 'experience';
}

const AddCredentialDialog: React.FC<AddCredentialDialogProps> = ({
  open,
  onClose,
  onAddCredential,
  credentialType
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getDialogTitle = () => {
    switch (credentialType) {
      case 'academic':
        return 'Add Academic Credential';
      case 'certification':
        return 'Add Professional Certification';
      case 'experience':
        return 'Add Work Experience';
      default:
        return 'Add New Credential';
    }
  };

  const generateBlockchainHash = async () => {
    const randomBytes = new Uint8Array(32);
    window.crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      
      const blockchain_hash = await generateBlockchainHash();
      
      const { data, error } = await supabase
        .from('credentials')
        .insert({
          user_id: user.id,
          title: formData.title,
          issuer: formData.issuer,
          issue_date: formData.issue_date,
          expiry_date: formData.expiry_date || null,
          description: formData.description,
          credential_type: credentialType,
          blockchain_hash,
          verification_status: 'verified'
        })
        .select()
        .single();

      if (error) throw error;
      
      onAddCredential(data as Credential);
      onClose();
      toast.success('Credential added successfully');
    } catch (error: any) {
      console.error('Error adding credential:', error);
      toast.error('Failed to add credential');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title" 
              value={formData.title}
              onChange={handleChange}
              required
              placeholder={
                credentialType === 'academic' ? "e.g., Bachelor of Science in Computer Science" :
                credentialType === 'certification' ? "e.g., AWS Certified Solutions Architect" :
                "e.g., Senior Software Engineer"
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issuer">
              {credentialType === 'experience' ? 'Company' : 'Issuing Institution'}
            </Label>
            <Input
              id="issuer"
              name="issuer" 
              value={formData.issuer}
              onChange={handleChange}
              required
              placeholder={
                credentialType === 'academic' ? "e.g., Stanford University" :
                credentialType === 'certification' ? "e.g., Amazon Web Services" :
                "e.g., Google Inc."
              }
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issue_date">
                {credentialType === 'experience' ? 'Start Date' : 'Issue Date'}
              </Label>
              <Input
                id="issue_date"
                name="issue_date" 
                type="date"
                value={formData.issue_date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiry_date">
                {credentialType === 'experience' ? 'End Date' : 'Expiry Date'} (Optional)
              </Label>
              <Input
                id="expiry_date"
                name="expiry_date" 
                type="date"
                value={formData.expiry_date}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description" 
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder={
                credentialType === 'academic' ? "e.g., Graduated with honors, GPA 3.8/4.0" :
                credentialType === 'certification' ? "e.g., Professional cloud architect certification" :
                "e.g., Led a team of 5 engineers, developed scalable solutions"
              }
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Credential'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCredentialDialog;
