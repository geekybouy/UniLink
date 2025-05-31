
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Credential } from '@/types/credentials';
import CredentialWalletHeader from "@/components/credentials/CredentialWalletHeader";
import CredentialWalletTabs from "@/components/credentials/CredentialWalletTabs";
import AddCredentialDialog from '@/components/credentials/AddCredentialDialog';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from "@/components/ErrorBoundary";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Share } from 'lucide-react';

const Credentials = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCredential, setShowAddCredential] = useState(false);
  const [selectedType, setSelectedType] = useState<'academic' | 'certification' | 'experience'>('academic');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCredentials();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchCredentials = async () => {
    if (!user) {
      setError("User not found. Please log in.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setCredentials(data as Credential[]);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching credentials:', error);
      setError('Failed to load credentials');
      toast.error('Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCredentials = credentials.filter(
    cred => cred.credential_type === selectedType
  );

  const handleAddCredential = (type: 'academic' | 'certification' | 'experience') => {
    setSelectedType(type);
    setShowAddCredential(true);
  };

  const handleCredentialAdded = (newCredential: Credential) => {
    setCredentials(prev => [newCredential, ...prev]);
    setShowAddCredential(false);
    toast.success('Credential added successfully');
  };

  const handleShare = () => {
    navigate('/share-credentials');
  };

  const handleDeleteCredential = async (id: string) => {
    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setCredentials(credentials.filter(cred => cred.id !== id));
      toast.success('Credential deleted successfully');
    } catch (error: any) {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credential');
    }
  };

  const handleShareCredential = (id: string) => {
    navigate(`/share-credentials?id=${id}`);
  };

  const getEmptyMessage = () => {
    switch (selectedType) {
      case 'academic':
        return 'No academic credentials added yet.';
      case 'certification':
        return 'No professional certifications added yet.';
      case 'experience':
        return 'No work experience credentials added yet.';
      default:
        return 'No credentials found.';
    }
  };

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="bg-background/90 border shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">User session not found. Please log in again.</p>
            <Button onClick={() => navigate('/auth/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen w-full bg-background pb-16 overflow-x-hidden">
        <CredentialWalletHeader
          onAddCredential={() => setShowAddCredential(true)}
          onShare={handleShare}
        />
        {/* Blockchain credentials info card moved here */}
        <div className="container mx-auto px-4 pt-24 max-w-4xl">
          <Card className="mb-9 w-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Blockchain Secured Credentials
                </CardTitle>
              </div>
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleShare}
              >
                <Share className="h-4 w-4" />
                Share Credentials
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your credentials are securely stored on the Polygon blockchain, making them tamper-proof and easily verifiable by authorized parties.
              </p>
            </CardContent>
          </Card>
        </div>
        <main className="container mx-auto px-4 pb-8 w-full max-w-4xl animate-fade-in">
          {error && (
            <div className="flex flex-col items-center justify-center p-6">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          )}
          {!error && (
            <CredentialWalletTabs
              isLoading={isLoading}
              credentials={credentials}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              getEmptyMessage={getEmptyMessage}
              onDelete={handleDeleteCredential}
              onShare={handleShareCredential}
              onAddCredential={handleAddCredential}
            />
          )}
        </main>
        {showAddCredential && (
          <AddCredentialDialog 
            open={showAddCredential}
            onClose={() => setShowAddCredential(false)}
            onAddCredential={handleCredentialAdded}
            credentialType={selectedType}
          />
        )}
        <BottomNav />
      </div>
    </ErrorBoundary>
  );
};

export default Credentials;

