
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

const CredentialWallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCredential, setShowAddCredential] = useState(false);
  const [selectedType, setSelectedType] = useState<'academic' | 'certification' | 'experience'>('academic');

  useEffect(() => {
    if (user) {
      fetchCredentials();
    }
  }, [user]);

  const fetchCredentials = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setCredentials(data as Credential[]);
    } catch (error: any) {
      console.error('Error fetching credentials:', error);
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

  return (
    <div className="flex flex-col min-h-screen w-full bg-background pb-16 overflow-x-hidden">
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-24" />
          <h1 className="text-2xl font-playfair text-primary font-bold">Credential Wallet</h1>
          <div className="w-24 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAddCredential(true)}>
              Add New
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-24 pb-8 w-full max-w-4xl">
        <Card className="mb-6 w-full">
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

        <Tabs defaultValue="academic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="academic" onClick={() => setSelectedType('academic')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="certification" onClick={() => setSelectedType('certification')}>
              <Shield className="h-4 w-4 mr-2" />
              Certifications
            </TabsTrigger>
            <TabsTrigger value="experience" onClick={() => setSelectedType('experience')}>
              <Briefcase className="h-4 w-4 mr-2" />
              Experience
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="academic" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">Loading...</div>
            ) : filteredCredentials.length > 0 ? (
              filteredCredentials.map(credential => (
                <CredentialItem 
                  key={credential.id} 
                  credential={credential} 
                  onDelete={handleDeleteCredential}
                  onShare={handleShareCredential}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{getEmptyMessage()}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => handleAddCredential('academic')}
                >
                  Add Academic Credential
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="certification" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">Loading...</div>
            ) : filteredCredentials.length > 0 ? (
              filteredCredentials.map(credential => (
                <CredentialItem 
                  key={credential.id} 
                  credential={credential} 
                  onDelete={handleDeleteCredential}
                  onShare={handleShareCredential}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{getEmptyMessage()}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => handleAddCredential('certification')}
                >
                  Add Professional Certification
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="experience" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">Loading...</div>
            ) : filteredCredentials.length > 0 ? (
              filteredCredentials.map(credential => (
                <CredentialItem 
                  key={credential.id} 
                  credential={credential} 
                  onDelete={handleDeleteCredential}
                  onShare={handleShareCredential}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{getEmptyMessage()}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => handleAddCredential('experience')}
                >
                  Add Work Experience
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
  );
};

export default CredentialWallet;
