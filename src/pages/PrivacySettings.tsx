import React, { useEffect, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, Users } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ui/theme-toggle';

type ConnectionVisibility = 'public' | 'connections' | 'private';

interface PrivacySettings {
  connection_visibility: ConnectionVisibility;
  allow_connection_requests: boolean;
}

const PrivacySettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    connection_visibility: 'public',
    allow_connection_requests: true
  });

  useEffect(() => {
    if (user) {
      fetchPrivacySettings();
    }
  }, [user]);

  const fetchPrivacySettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get user privacy settings or create if they don't exist
      let { data, error } = await supabase
        .from('user_privacy')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Record doesn't exist, create default settings
          const { data: newData, error: insertError } = await supabase
            .from('user_privacy')
            .insert({
              user_id: user.id,
              connection_visibility: 'public',
              allow_connection_requests: true
            })
            .select('*')
            .single();
          
          if (insertError) throw insertError;
          data = newData;
        } else {
          throw error;
        }
      }
      
      if (data) {
        setSettings({
          connection_visibility: data.connection_visibility as ConnectionVisibility,
          allow_connection_requests: data.allow_connection_requests
        });
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      toast.error('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_privacy')
        .upsert({
          user_id: user.id,
          connection_visibility: settings.connection_visibility,
          allow_connection_requests: settings.allow_connection_requests
        });
      
      if (error) throw error;
      
      toast.success('Privacy settings saved successfully');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast.error('Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-6">
          <h1 className="text-2xl font-bold mb-1">Privacy Settings</h1>
          {/* Theme toggle (only show if theme context is available) */}
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Connection Privacy
              </CardTitle>
              <CardDescription>
                Control who can see your connections and send you connection requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Who can see your connections?</h3>
                <Select
                  value={settings.connection_visibility}
                  onValueChange={(value: 'public' | 'connections' | 'private') => 
                    setSettings(prev => ({ ...prev, connection_visibility: value }))
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="w-full sm:w-72">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> Public (Everyone)
                      </div>
                    </SelectItem>
                    <SelectItem value="connections">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> Connections Only
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" /> Only Me
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {settings.connection_visibility === 'public' 
                    ? 'Anyone can view who you are connected with'
                    : settings.connection_visibility === 'connections'
                    ? 'Only your connections can see who you are connected with'
                    : 'No one can see who you are connected with'}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Allow connection requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Others can send you connection requests
                  </p>
                </div>
                <Switch
                  checked={settings.allow_connection_requests}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, allow_connection_requests: checked }))
                  }
                  disabled={loading}
                />
              </div>
              
              <Button onClick={handleSaveSettings} disabled={loading || saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacySettingsPage;
