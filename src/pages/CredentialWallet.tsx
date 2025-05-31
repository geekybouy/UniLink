import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from '@/components/BottomNav';
import { Shield, BookOpen, Briefcase, Share } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import CredentialItem from '@/components/credentials/CredentialItem';
import AddCredentialDialog from '@/components/credentials/AddCredentialDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Credential } from '@/types/credentials';
import ErrorBoundary from "@/components/ErrorBoundary";
import CredentialWalletHeader from "@/components/credentials/CredentialWalletHeader";
import CredentialWalletTabs from "@/components/credentials/CredentialWalletTabs";

// Remove any ProfileProvider or JobsProvider wrappers here! Context is from main.tsx only.

const CredentialWallet = () => {
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

  // Add these handlers for the CredentialItem props
  const handleDeleteCredential = async (id: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setCredentials(credentials.filter(cred => cred.id !== id));
      toast.success('Credential deleted successfully');
    } catch (error: any) {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credential');
    }
  };

  const handleShareCredential = (id: string) => {
    // Navigate to share page with credential ID
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

  // --- Defensive blank-screen fallback ---
  if (!user && !isLoading) {
    // If user is not loaded, show error
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">User session not found. Please log in again.</p>
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
        <main className="container mx-auto px-4 pt-48 pb-8 w-full max-w-4xl">
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

export default CredentialWallet;
