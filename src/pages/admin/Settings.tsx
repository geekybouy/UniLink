
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Save } from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  logo: string | null;
  favicon: string | null;
  theme: 'light' | 'dark' | 'system';
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

interface ContentSettings {
  requireApproval: boolean;
  allowComments: boolean;
  allowVoting: boolean;
  moderationKeywords: string[];
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  digestEmails: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly';
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'UniLink',
    siteDescription: 'A platform connecting students, alumni, and faculty',
    contactEmail: 'admin@unilink.edu',
    logo: null,
    favicon: null,
    theme: 'system',
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: 'student',
    maintenance: {
      enabled: false,
      message: 'The site is currently undergoing maintenance. Please check back later.'
    }
  });
  
  const [contentSettings, setContentSettings] = useState<ContentSettings>({
    requireApproval: true,
    allowComments: true,
    allowVoting: true,
    moderationKeywords: ['spam', 'offensive', 'inappropriate']
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    digestEmails: true,
    digestFrequency: 'weekly'
  });
  
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Simulate loading settings
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  
  // Track changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges]);
  
  const handleSiteSettingChange = (
    name: string, 
    value: string | boolean
  ) => {
    setSiteSettings(prev => ({
      ...prev,
      [name]: value
    }));
    
    setUnsavedChanges(true);
  };
  
  const handleMaintenanceChange = (
    name: string,
    value: string | boolean
  ) => {
    setSiteSettings(prev => ({
      ...prev,
      maintenance: {
        ...prev.maintenance,
        [name]: value
      }
    }));
    
    setUnsavedChanges(true);
  };
  
  const handleContentSettingChange = (
    name: string,
    value: string | boolean | string[]
  ) => {
    setContentSettings(prev => ({
      ...prev,
      [name]: value
    }));
    
    setUnsavedChanges(true);
  };
  
  const handleAddModerationKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const newKeyword = e.currentTarget.value.trim();
      if (!contentSettings.moderationKeywords.includes(newKeyword)) {
        handleContentSettingChange(
          'moderationKeywords', 
          [...contentSettings.moderationKeywords, newKeyword]
        );
      }
      e.currentTarget.value = '';
    }
  };
  
  const handleRemoveModerationKeyword = (keyword: string) => {
    handleContentSettingChange(
      'moderationKeywords',
      contentSettings.moderationKeywords.filter(k => k !== keyword)
    );
  };
  
  const handleNotificationSettingChange = (
    name: string,
    value: string | boolean
  ) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: value
    }));
    
    setUnsavedChanges(true);
  };
  
  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate saving to the database
    setTimeout(() => {
      setLoading(false);
      setUnsavedChanges(false);
      toast.success('Settings saved successfully');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={!unsavedChanges}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
      
      {unsavedChanges && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center text-yellow-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>You have unsaved changes. Make sure to save before leaving this page.</span>
        </div>
      )}
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Basic information about your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input 
                  id="siteName" 
                  value={siteSettings.siteName} 
                  onChange={(e) => handleSiteSettingChange('siteName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea 
                  id="siteDescription" 
                  value={siteSettings.siteDescription}
                  onChange={(e) => handleSiteSettingChange('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input 
                  id="contactEmail" 
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={(e) => handleSiteSettingChange('contactEmail', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize your platform's look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Default Theme</Label>
                <Select 
                  value={siteSettings.theme}
                  onValueChange={(value) => handleSiteSettingChange('theme', value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center gap-4">
                  {siteSettings.logo ? (
                    <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                      <img src={siteSettings.logo} alt="Logo" className="max-h-full max-w-full" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 border">
                      No logo
                    </div>
                  )}
                  <Button variant="outline" size="sm">Upload Logo</Button>
                  {siteSettings.logo && (
                    <Button variant="ghost" size="sm">Remove</Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon</Label>
                <div className="flex items-center gap-4">
                  {siteSettings.favicon ? (
                    <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center">
                      <img src={siteSettings.favicon} alt="Favicon" className="max-h-full max-w-full" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 border">
                      No icon
                    </div>
                  )}
                  <Button variant="outline" size="sm">Upload Favicon</Button>
                  {siteSettings.favicon && (
                    <Button variant="ghost" size="sm">Remove</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Registration</CardTitle>
              <CardDescription>Configure user registration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowRegistration">Allow Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable new user registration
                  </p>
                </div>
                <Switch 
                  id="allowRegistration"
                  checked={siteSettings.allowRegistration}
                  onCheckedChange={(checked) => handleSiteSettingChange('allowRegistration', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before accessing the platform
                  </p>
                </div>
                <Switch 
                  id="requireEmailVerification"
                  checked={siteSettings.requireEmailVerification}
                  onCheckedChange={(checked) => handleSiteSettingChange('requireEmailVerification', checked)}
                  disabled={!siteSettings.allowRegistration}
                />
              </div>
              
              <div className="space-y-2 pt-4">
                <Label htmlFor="defaultUserRole">Default User Role</Label>
                <Select 
                  value={siteSettings.defaultUserRole}
                  onValueChange={(value) => handleSiteSettingChange('defaultUserRole', value)}
                  disabled={!siteSettings.allowRegistration}
                >
                  <SelectTrigger id="defaultUserRole">
                    <SelectValue placeholder="Select default role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                When enabled, the site will be inaccessible to regular users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Only administrators will be able to access the site
                  </p>
                </div>
                <Switch 
                  id="maintenanceMode"
                  checked={siteSettings.maintenance.enabled}
                  onCheckedChange={(checked) => handleMaintenanceChange('enabled', checked)}
                />
              </div>
              
              <div className="space-y-2 pt-4">
                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                <Textarea 
                  id="maintenanceMessage"
                  value={siteSettings.maintenance.message}
                  onChange={(e) => handleMaintenanceChange('message', e.target.value)}
                  rows={3}
                  disabled={!siteSettings.maintenance.enabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content Settings */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>Configure how content is moderated on the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireApproval">Require Content Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    All content must be approved by a moderator before being published
                  </p>
                </div>
                <Switch 
                  id="requireApproval"
                  checked={contentSettings.requireApproval}
                  onCheckedChange={(checked) => handleContentSettingChange('requireApproval', checked)}
                />
              </div>
              
              <div className="space-y-2 pt-6">
                <Label>Moderation Keywords</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Content containing these keywords will be flagged for review
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {contentSettings.moderationKeywords.map(keyword => (
                    <Badge 
                      key={keyword} 
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {keyword}
                      <button 
                        className="ml-2 text-xs hover:text-destructive"
                        onClick={() => handleRemoveModerationKeyword(keyword)}
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <Input 
                  placeholder="Type a keyword and press Enter"
                  onKeyDown={handleAddModerationKeyword}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Interactions</CardTitle>
              <CardDescription>Configure how users can interact with content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowComments">Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Users can comment on posts and content
                  </p>
                </div>
                <Switch 
                  id="allowComments"
                  checked={contentSettings.allowComments}
                  onCheckedChange={(checked) => handleContentSettingChange('allowComments', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="allowVoting">Allow Voting</Label>
                  <p className="text-sm text-muted-foreground">
                    Users can upvote or downvote content
                  </p>
                </div>
                <Switch 
                  id="allowVoting"
                  checked={contentSettings.allowVoting}
                  onCheckedChange={(checked) => handleContentSettingChange('allowVoting', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Configure how users receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via email
                  </p>
                </div>
                <Switch 
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationSettingChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send browser push notifications
                  </p>
                </div>
                <Switch 
                  id="pushNotifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => handleNotificationSettingChange('pushNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Digest Emails</CardTitle>
              <CardDescription>Configure digest email settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="digestEmails">Send Digest Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Send periodic digest emails to users
                  </p>
                </div>
                <Switch 
                  id="digestEmails"
                  checked={notificationSettings.digestEmails}
                  onCheckedChange={(checked) => handleNotificationSettingChange('digestEmails', checked)}
                />
              </div>
              
              <div className="space-y-2 pt-4">
                <Label htmlFor="digestFrequency">Digest Frequency</Label>
                <Select 
                  value={notificationSettings.digestFrequency}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => handleNotificationSettingChange('digestFrequency', value)}
                  disabled={!notificationSettings.digestEmails}
                >
                  <SelectTrigger id="digestFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {unsavedChanges && (
        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default Settings;
