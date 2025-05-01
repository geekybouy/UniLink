import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash, Linkedin, Github, Twitter, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/contexts/ProfileContext';
import { SocialLink } from '@/types/profile';
import { typedSupabaseClient } from '@/integrations/supabase/customClient';
import { v4 as uuidv4 } from 'uuid';

interface SocialLinkFormData {
  platform: 'linkedin' | 'github' | 'twitter' | 'website' | 'other';
  url: string;
}

const SocialLinksStep = () => {
  const { profile, refreshProfile } = useProfile();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<SocialLinkFormData>({
    defaultValues: {
      platform: 'linkedin',
      url: ''
    }
  });
  
  const currentPlatform = watch('platform');
  
  useEffect(() => {
    if (profile?.socialLinks) {
      setSocialLinks(profile.socialLinks);
    }
  }, [profile]);

  useEffect(() => {
    if (editingLink) {
      setValue('platform', editingLink.platform);
      setValue('url', editingLink.url);
    }
  }, [editingLink, setValue]);

  const onSubmit = async (data: SocialLinkFormData) => {
    try {
      setIsSubmitting(true);
      
      if (!profile) {
        toast.error('User profile not found');
        return;
      }
      
      // Validate URL
      let url = data.url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      try {
        new URL(url);
      } catch (e) {
        toast.error('Please enter a valid URL');
        setIsSubmitting(false);
        return;
      }
      
      if (editingLink) {
        // Update existing link
        const { error } = await typedSupabaseClient.socialLinks.update(editingLink.id, {
          platform: data.platform,
          url: url
        });
          
        if (error) throw error;
        
        // Update local state
        setSocialLinks(socialLinks.map(link => 
          link.id === editingLink.id 
            ? { ...link, platform: data.platform, url: url } 
            : link
        ));
        
        toast.success('Social link updated');
      } else {
        // Add new link
        const linkId = uuidv4();
        
        const { error } = await typedSupabaseClient.socialLinks.insert({
          id: linkId,
          user_id: profile.userId,
          platform: data.platform,
          url: url
        });
          
        if (error) throw error;
        
        // Update local state
        setSocialLinks([...socialLinks, { id: linkId, platform: data.platform, url: url }]);
        
        toast.success('Social link added');
      }
      
      // Reset form and editing state
      reset({
        platform: 'linkedin',
        url: ''
      });
      setEditingLink(null);
      
      // Refresh profile
      await refreshProfile();
      
    } catch (error: any) {
      toast.error('Failed to save social link: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (link: SocialLink) => {
    setEditingLink(link);
  };

  const handleDelete = async (link: SocialLink) => {
    try {
      if (!profile) return;
      
      // Delete from database
      const { error } = await typedSupabaseClient.socialLinks.delete(link.id);
        
      if (error) throw error;
      
      // Update local state
      setSocialLinks(socialLinks.filter(l => l.id !== link.id));
      
      // Reset editing state if needed
      if (editingLink && editingLink.id === link.id) {
        setEditingLink(null);
        reset({
          platform: 'linkedin',
          url: ''
        });
      }
      
      // Refresh profile
      await refreshProfile();
      
      toast.success('Social link removed');
    } catch (error: any) {
      toast.error('Failed to remove social link: ' + error.message);
    }
  };

  const cancelEdit = () => {
    setEditingLink(null);
    reset({
      platform: 'linkedin',
      url: ''
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-600" />;
      case 'github':
        return <Github className="h-5 w-5 text-gray-800" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />;
      default:
        return <LinkIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return 'LinkedIn';
      case 'github':
        return 'GitHub';
      case 'twitter':
        return 'Twitter';
      case 'website':
        return 'Website';
      default:
        return 'Other';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Links</h3>
        <p className="text-sm text-muted-foreground">
          Connect your professional social accounts and websites
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select 
              value={currentPlatform} 
              onValueChange={(value: any) => setValue('platform', value)}
            >
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="website">Personal Website</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <div className="flex space-x-2">
              <Input
                id="url"
                {...register('url', { required: 'URL is required' })}
                placeholder="https://..."
                className="flex-1"
              />
              <Button type="submit" disabled={isSubmitting}>
                {editingLink ? 'Update' : 'Add'}
              </Button>
              {editingLink && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>
        </div>
      </form>
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Your Links</h4>
        
        {socialLinks.length > 0 ? (
          <div className="space-y-2">
            {socialLinks.map((link, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(link.platform)}
                    <div>
                      <p className="font-medium">{getPlatformLabel(link.platform)}</p>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {link.url}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(link)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(link)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No social links added yet</p>
            <p className="text-xs text-muted-foreground">
              Add links to your professional profiles to help others connect with you
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialLinksStep;
