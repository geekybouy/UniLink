
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Credential } from '@/types/credentials';
import { QrCode, Link, Copy, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ShareLinkDialog from '@/components/credentials/ShareLinkDialog';
import ShareQRDialog from '@/components/credentials/ShareQRDialog';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const ShareCredentials = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchCredentials();
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', user?.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      
      if (data) {
        // Type assertion to ensure compatibility with Credential type
        setCredentials(data as Credential[]);
      }
    } catch (error: any) {
      console.error('Error fetching credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (credentialId: string) => {
    setSelectedCredentials(prev => {
      if (prev.includes(credentialId)) {
        return prev.filter(id => id !== credentialId);
      } else {
        return [...prev, credentialId];
      }
    });
  };

  const handleShareLink = async () => {
    if (selectedCredentials.length === 0) {
      toast.error('Please select at least one credential to share');
      return;
    }

    try {
      const shareId = uuidv4();
      const shareData = {
        id: shareId,
        user_id: user?.id,
        credential_ids: selectedCredentials,
        expiry_date: expiryEnabled ? new Date(expiryDate).toISOString() : null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('credential_shares')
        .insert(shareData);

      if (error) throw error;

      // Generate a share URL with the unique ID
      const shareUrl = `${window.location.origin}/shared/${shareId}`;
      setShareUrl(shareUrl);
      setShowLinkDialog(true);
      
      toast.success('Credentials shared successfully');
    } catch (error: any) {
      console.error('Error sharing credentials:', error);
      toast.error('Failed to share credentials');
    }
  };

  const handleShareQR = async () => {
    if (selectedCredentials.length === 0) {
      toast.error('Please select at least one credential to share');
      return;
    }

    try {
      const shareId = uuidv4();
      const shareData = {
        id: shareId,
        user_id: user?.id,
        credential_ids: selectedCredentials,
        expiry_date: expiryEnabled ? new Date(expiryDate).toISOString() : null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('credential_shares')
        .insert(shareData);

      if (error) throw error;

      // Generate a share URL with the unique ID
      const shareUrl = `${window.location.origin}/shared/${shareId}`;
      setShareUrl(shareUrl);
      setShowQRDialog(true);
      
      toast.success('QR code generated successfully');
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-24" />
          <h1 className="text-2xl font-playfair text-primary font-bold">Share Credentials</h1>
          <div className="w-24" />
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-24 pb-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Select Credentials to Share</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which credentials you'd like to share with others. These credentials 
              will be accessible via a secure link or QR code.
            </p>
            
            {isLoading ? (
              <div className="flex justify-center py-8">Loading...</div>
            ) : credentials.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
                {credentials.map((credential) => (
                  <div key={credential.id} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50">
                    <Checkbox 
                      id={`credential-${credential.id}`} 
                      checked={selectedCredentials.includes(credential.id)}
                      onCheckedChange={() => handleCheckboxChange(credential.id)}
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor={`credential-${credential.id}`} className="font-medium">
                        {credential.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {credential.issuer} · {formatDate(credential.issue_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You don't have any credentials to share yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/credentials')}
                >
                  Add Credentials First
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Share Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Set Expiration Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Define when this shared link will expire
                  </p>
                </div>
                <Switch 
                  checked={expiryEnabled} 
                  onCheckedChange={setExpiryEnabled} 
                  id="expiry-switch"
                />
              </div>
              
              {expiryEnabled && (
                <div className="grid gap-2">
                  <Label htmlFor="expiry-date">Expiration Date</Label>
                  <Input 
                    id="expiry-date" 
                    type="date" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button
            variant="outline"
            className="flex-1 flex items-center gap-2"
            onClick={handleShareLink}
            disabled={selectedCredentials.length === 0 || (expiryEnabled && !expiryDate)}
          >
            <Link className="h-4 w-4" />
            Generate Sharing Link
          </Button>
          <Button
            className="flex-1 flex items-center gap-2"
            onClick={handleShareQR}
            disabled={selectedCredentials.length === 0 || (expiryEnabled && !expiryDate)}
          >
            <QrCode className="h-4 w-4" />
            Generate QR Code
          </Button>
        </div>
      </main>

      <ShareLinkDialog 
        open={showLinkDialog} 
        onClose={() => setShowLinkDialog(false)} 
        shareUrl={shareUrl} 
      />

      <ShareQRDialog 
        open={showQRDialog} 
        onClose={() => setShowQRDialog(false)} 
        shareUrl={shareUrl} 
      />

      <BottomNav />
    </div>
  );
};

export default ShareCredentials;
