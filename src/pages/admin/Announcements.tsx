import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
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
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { BellRing, CalendarIcon, Edit, Eye, Trash, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Fixing the type definition for announcement type
type AnnouncementType = 'info' | 'warning' | 'success' | 'error';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  created_at: string;
  created_by: string;
  created_by_name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  target_audience: string[];
}

const AnnouncementPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as AnnouncementType,
    start_date: new Date(),
    end_date: null as Date | null,
    is_active: true,
    target_audience: [] as string[]
  });
  
  const { user } = useAuth();
  
  // Generate mock data
  useEffect(() => {
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'System Maintenance',
        content: 'The system will be undergoing maintenance on Saturday, June 10th from 2:00 AM to 4:00 AM UTC. Some services may be temporarily unavailable.',
        type: 'warning',
        created_at: '2023-06-05T10:30:00Z',
        created_by: 'admin-1',
        created_by_name: 'Admin User',
        start_date: '2023-06-05T00:00:00Z',
        end_date: '2023-06-15T23:59:59Z',
        is_active: true,
        target_audience: ['all']
      },
      {
        id: '2',
        title: 'New Feature: Enhanced Analytics',
        content: 'We\'ve released enhanced analytics for all users. Check out the new dashboard to see detailed insights about your activity.',
        type: 'info',
        created_at: '2023-06-02T14:15:00Z',
        created_by: 'admin-2',
        created_by_name: 'Product Manager',
        start_date: '2023-06-02T00:00:00Z',
        end_date: null,
        is_active: true,
        target_audience: ['alumni', 'faculty']
      },
      {
        id: '3',
        title: 'Login System Update',
        content: 'We\'ve updated our login system to improve security. If you experience any issues, please contact support.',
        type: 'success',
        created_at: '2023-05-28T09:45:00Z',
        created_by: 'admin-1',
        created_by_name: 'Admin User',
        start_date: '2023-05-28T00:00:00Z',
        end_date: '2023-06-08T23:59:59Z',
        is_active: false,
        target_audience: ['all']
      },
      {
        id: '4',
        title: 'Important Privacy Policy Update',
        content: 'Our privacy policy has been updated. Please review the changes at your earliest convenience.',
        type: 'error',
        created_at: '2023-05-20T16:30:00Z',
        created_by: 'admin-3',
        created_by_name: 'Legal Team',
        start_date: '2023-05-20T00:00:00Z',
        end_date: null,
        is_active: true,
        target_audience: ['student', 'alumni', 'faculty']
      }
    ];
    
    setAnnouncements(mockAnnouncements);
    setLoading(false);
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAnnouncement(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTypeChange = (value: string) => {
    setNewAnnouncement(prev => ({ ...prev, type: value as 'info' | 'warning' | 'success' | 'error' }));
  };
  
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setNewAnnouncement(prev => ({ ...prev, start_date: date }));
    }
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    setNewAnnouncement(prev => ({ ...prev, end_date: date || null }));
  };
  
  const handleTargetAudienceChange = (audience: string, checked: boolean) => {
    if (checked) {
      if (audience === 'all') {
        setNewAnnouncement(prev => ({ ...prev, target_audience: ['all'] }));
      } else {
        setNewAnnouncement(prev => ({
          ...prev,
          target_audience: prev.target_audience.includes('all') 
            ? [audience] 
            : [...prev.target_audience.filter(a => a !== 'all'), audience]
        }));
      }
    } else {
      setNewAnnouncement(prev => ({
        ...prev,
        target_audience: prev.target_audience.filter(a => a !== audience)
      }));
    }
  };
  
  const handleCreateAnnouncement = () => {
    // Validation
    if (!newAnnouncement.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!newAnnouncement.content.trim()) {
      toast.error('Content is required');
      return;
    }
    
    if (newAnnouncement.target_audience.length === 0) {
      toast.error('Target audience is required');
      return;
    }
    
    // In a real app, we would save to the database
    const newId = `announcement-${Date.now()}`;
    
    const createdAnnouncement: Announcement = {
      id: newId,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      type: newAnnouncement.type,
      created_at: new Date().toISOString(),
      created_by: user?.id || 'unknown',
      created_by_name: 'Admin User',
      start_date: newAnnouncement.start_date.toISOString(),
      end_date: newAnnouncement.end_date?.toISOString() || null,
      is_active: newAnnouncement.is_active,
      target_audience: newAnnouncement.target_audience
    };
    
    // Add to state
    setAnnouncements([createdAnnouncement, ...announcements]);
    
    // Reset form
    setNewAnnouncement({
      title: '',
      content: '',
      type: 'info',
      start_date: new Date(),
      end_date: null,
      is_active: true,
      target_audience: []
    });
    
    setIsCreateDialogOpen(false);
    toast.success('Announcement created successfully');
  };
  
  const handleViewAnnouncement = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setIsPreviewDialogOpen(true);
  };
  
  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      // In a real app, we would delete from the database
      setAnnouncements(announcements.filter(a => a.id !== id));
      toast.success('Announcement deleted successfully');
    }
  };
  
  const handleToggleActive = (id: string, isActive: boolean) => {
    // In a real app, we would update the database
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, is_active: isActive } : a
    ));
    
    toast.success(`Announcement ${isActive ? 'activated' : 'deactivated'} successfully`);
  };
  
  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getAnnouncementTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-amber-500 text-white">Warning</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-600 text-white">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Important</Badge>;
      default:
        return <Badge variant="outline">Notice</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading announcements...</span>
      </div>
    );
  }

  const renderActivateButton = (record: Announcement) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleToggleActive(record.id, !record.is_active)}
    >
      {record.is_active ? 'Deactivate' : 'Activate'}
    </Button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Announcements</h1>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Announcement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create a new announcement to notify users of important information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title"
                  name="title"
                  placeholder="Announcement Title"
                  value={newAnnouncement.title}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea 
                  id="content"
                  name="content"
                  placeholder="Announcement content..."
                  rows={5}
                  value={newAnnouncement.content}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={newAnnouncement.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Important</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newAnnouncement.start_date ? (
                          format(newAnnouncement.start_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newAnnouncement.start_date}
                        onSelect={handleStartDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newAnnouncement.end_date ? (
                          format(newAnnouncement.end_date, "PPP")
                        ) : (
                          <span>No end date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newAnnouncement.end_date || undefined}
                        onSelect={handleEndDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="audience-all"
                      checked={newAnnouncement.target_audience.includes('all')}
                      onCheckedChange={(checked) => handleTargetAudienceChange('all', !!checked)}
                    />
                    <Label htmlFor="audience-all">All Users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="audience-students"
                      checked={newAnnouncement.target_audience.includes('student')}
                      onCheckedChange={(checked) => handleTargetAudienceChange('student', !!checked)}
                      disabled={newAnnouncement.target_audience.includes('all')}
                    />
                    <Label htmlFor="audience-students">Students</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="audience-alumni"
                      checked={newAnnouncement.target_audience.includes('alumni')}
                      onCheckedChange={(checked) => handleTargetAudienceChange('alumni', !!checked)}
                      disabled={newAnnouncement.target_audience.includes('all')}
                    />
                    <Label htmlFor="audience-alumni">Alumni</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="audience-faculty"
                      checked={newAnnouncement.target_audience.includes('faculty')}
                      onCheckedChange={(checked) => handleTargetAudienceChange('faculty', !!checked)}
                      disabled={newAnnouncement.target_audience.includes('all')}
                    />
                    <Label htmlFor="audience-faculty">Faculty</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="is-active"
                  checked={newAnnouncement.is_active}
                  onCheckedChange={(checked) => setNewAnnouncement(prev => ({ ...prev, is_active: !!checked }))}
                />
                <Label htmlFor="is-active">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAnnouncement}>Create Announcement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="relative">
            {!announcement.is_active && (
              <div className="absolute top-0 right-0 bg-muted px-2 py-1 text-xs rounded-bl">
                Inactive
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5" />
                    {announcement.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Posted by {announcement.created_by_name} on {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                  </CardDescription>
                </div>
                {getAnnouncementTypeBadge(announcement.type)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2">{announcement.content}</p>
              
              <div className="flex flex-wrap gap-2 mt-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Start:</span> {format(new Date(announcement.start_date), 'MMM d, yyyy')}
                </div>
                {announcement.end_date && (
                  <div>
                    <span className="font-medium">End:</span> {format(new Date(announcement.end_date), 'MMM d, yyyy')}
                  </div>
                )}
                <div>
                  <span className="font-medium">Audience:</span> {announcement.target_audience.includes('all') 
                    ? 'All Users' 
                    : announcement.target_audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => handleViewAnnouncement(announcement)}>
                <Eye className="h-4 w-4 mr-2" /> View
              </Button>
              {renderActivateButton(announcement)}
              <Button variant="outline" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                <Trash className="h-4 w-4 mr-2" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>{currentAnnouncement?.title}</DialogTitle>
              {currentAnnouncement && getAnnouncementTypeBadge(currentAnnouncement.type)}
            </div>
            <DialogDescription>
              Posted by {currentAnnouncement?.created_by_name} on {currentAnnouncement && format(new Date(currentAnnouncement.created_at), 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="whitespace-pre-wrap">
              {currentAnnouncement?.content}
            </div>
            
            <div className="pt-4 border-t space-y-2">
              <div>
                <span className="font-medium">Start Date:</span> {currentAnnouncement && format(new Date(currentAnnouncement.start_date), 'MMMM d, yyyy')}
              </div>
              {currentAnnouncement?.end_date && (
                <div>
                  <span className="font-medium">End Date:</span> {format(new Date(currentAnnouncement.end_date), 'MMMM d, yyyy')}
                </div>
              )}
              <div>
                <span className="font-medium">Target Audience:</span> {currentAnnouncement?.target_audience.includes('all') 
                  ? 'All Users' 
                  : currentAnnouncement?.target_audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
              </div>
              <div>
                <span className="font-medium">Status:</span> {currentAnnouncement?.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementPage;
