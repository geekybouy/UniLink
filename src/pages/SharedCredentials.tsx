
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { Shield, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Credential } from '@/types/credentials';

interface ShareData {
  id: string;
  user_id: string;
  credential_ids: string[];
  created_at: string;
  expiry_date: string | null;
}

const SharedCredentials = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [ownerName, setOwnerName] = useState<string>('');

  useEffect(() => {
    if (shareId) {
      fetchSharedCredentials();
    }
  }, [shareId]);

  const fetchSharedCredentials = async () => {
    try {
      setLoading(true);
      
      // First fetch the share data
      const { data: shareData, error: shareError } = await supabase
        .from('credential_shares')
        .select('*')
        .eq('id', shareId)
        .single();
      
      if (shareError) throw new Error('Share not found or has been removed');
      
      // Check if the share has expired
      if (shareData.expiry_date && new Date(shareData.expiry_date) < new Date()) {
        setExpired(true);
        throw new Error('This credential share has expired');
      }
      
      // Get owner information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', shareData.user_id)
        .single();
      
      if (!userError && userData) {
        setOwnerName(userData.full_name);
      }
      
      // Fetch the shared credentials
      const { data: credentialData, error: credError } = await supabase
        .from('credentials')
        .select('*')
        .in('id', shareData.credential_ids)
        .order('issue_date', { ascending: false });
      
      if (credError) throw credError;
      
      // Type assertion to ensure compatibility with Credential type
      if (credentialData) {
        setCredentials(credentialData as Credential[]);
      }
    } catch (err: any) {
      console.error('Error fetching shared credentials:', err);
      setError(err.message);
      toast.error('Failed to load shared credentials');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading shared credentials...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we verify the credentials.</p>
        </div>
      </div>
    );
  }

  if (error || expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">
              {expired ? 'Share Expired' : 'Share Not Found'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              {expired 
                ? 'This credential share has expired and is no longer available.' 
                : 'The shared credentials you are looking for do not exist or have been removed.'}
            </p>
            <Button asChild>
              <a href="/">Return to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-playfair text-white text-center">
            Shared Credentials
          </h1>
          {ownerName && (
            <p className="text-center text-primary-foreground mt-2">
              Credentials shared by {ownerName}
            </p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Blockchain-Verified Credentials
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              These credentials have been securely shared with you and are verified on the blockchain,
              ensuring they are authentic and tamper-proof.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {credentials.map((cred) => (
            <Card key={cred.id} className="overflow-hidden">
              <div className="bg-primary/10 py-1 px-4 border-b flex justify-between items-center">
                <span className="text-xs font-medium text-primary">
                  {cred.credential_type.charAt(0).toUpperCase() + cred.credential_type.slice(1)} Credential
                </span>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500">
                  Verified
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg">{cred.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{cred.issuer}</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Description</h4>
                    <p className="text-sm">{cred.description || "No description provided"}</p>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">Issued On</h4>
                      <p className="flex items-center gap-1 text-sm">
                        <CalendarClock className="h-3 w-3" /> 
                        {formatDate(cred.issue_date)}
                      </p>
                    </div>
                    {cred.expiry_date && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Valid Until</h4>
                        <p className="flex items-center gap-1 text-sm">
                          <CalendarClock className="h-3 w-3" /> 
                          {formatDate(cred.expiry_date)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {cred.blockchain_hash && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">Blockchain Verification</h4>
                      <p className="text-xs font-mono break-all bg-gray-100 p-2 rounded">
                        {cred.blockchain_hash}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SharedCredentials;
