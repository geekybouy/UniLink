import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { useNotifications } from '@/contexts/NotificationsContext';
import { NotificationType } from '@/types/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const NotificationSettingsPage = () => {
  const { preferences, updatePreference, savePreferences } = useNotifications();
  const { toast } = useToast();

  const getNotificationTypeName = (type: NotificationType | string): string => {
    switch (type) {
      case 'connection_request': return 'Connection Requests';
      case 'connection_accepted': return 'Connection Accepted';
      case 'message': return 'New Messages';
      case 'event_reminder': return 'Event Reminders';
      case 'job_application': return 'Job Applications';
      case 'job_status_change': return 'Job Status Updates';
      case 'admin_announcement': return 'Admin Announcements';
      case 'content_mention': return 'Content Mentions';
      case 'post_liked': return 'Post Likes';
      case 'comment_added': return 'New Comments';
      default: 
        // Safely handle string manipulation for unknown types
        if (typeof type === 'string') {
          return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        return 'Unknown Notification Type';
    }
  };

  const handleSave = async () => {
    await savePreferences();
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated"
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notification Settings</h1>
            <p className="text-muted-foreground">
              Manage how you receive notifications from UniLink
            </p>
          </div>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which notifications you'd like to receive and how you want to receive them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <div className="grid grid-cols-4 p-4 bg-muted font-medium">
                  <div>Notification Type</div>
                  <div className="text-center">In-App</div>
                  <div className="text-center">Email</div>
                  <div className="text-center">Push</div>
                </div>
                <div className="divide-y">
                  {preferences.map((pref) => (
                    <div key={pref.id} className="grid grid-cols-4 p-4 items-center">
                      <div>{getNotificationTypeName(pref.type)}</div>
                      <div className="text-center">
                        <Switch 
                          checked={pref.in_app}
                          onCheckedChange={(checked) => updatePreference(pref.type as NotificationType, 'in_app', checked)}
                        />
                      </div>
                      <div className="text-center">
                        <Switch 
                          checked={pref.email}
                          onCheckedChange={(checked) => updatePreference(pref.type as NotificationType, 'email', checked)}
                        />
                      </div>
                      <div className="text-center">
                        <Switch 
                          checked={pref.push}
                          onCheckedChange={(checked) => updatePreference(pref.type as NotificationType, 'push', checked)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Browser Notifications</CardTitle>
              <CardDescription>
                Allow desktop notifications in your browser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Desktop Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications even when UniLink is not open in your browser
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    if ('Notification' in window) {
                      Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                          toast({
                            title: "Desktop notifications enabled",
                            description: "You'll now receive notifications when your browser is open"
                          });
                          // Example notification
                          new Notification('UniLink Notifications', {
                            body: 'You have successfully enabled desktop notifications',
                            icon: '/favicon.ico'
                          });
                        } else {
                          toast({
                            title: "Permission denied",
                            description: "You need to allow notifications in your browser settings",
                            variant: "destructive"
                          });
                        }
                      });
                    } else {
                      toast({
                        title: "Not supported",
                        description: "Your browser doesn't support desktop notifications",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationSettingsPage;
