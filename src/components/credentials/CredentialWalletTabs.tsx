
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Shield, Briefcase } from 'lucide-react';
import CredentialItem from '@/components/credentials/CredentialItem';
import { Button } from "@/components/ui/button";
import type { Credential } from '@/types/credentials';

interface CredentialWalletTabsProps {
  isLoading: boolean;
  credentials: Credential[];
  selectedType: 'academic' | 'certification' | 'experience';
  setSelectedType: (t: 'academic' | 'certification' | 'experience') => void;
  getEmptyMessage: () => string;
  onDelete: (id: string) => Promise<void>;
  onShare: (id: string) => void;
  onAddCredential: (type: 'academic' | 'certification' | 'experience') => void;
}

const CredentialWalletTabs: React.FC<CredentialWalletTabsProps> = ({
  isLoading,
  credentials,
  selectedType,
  setSelectedType,
  getEmptyMessage,
  onDelete,
  onShare,
  onAddCredential,
}) => {
  const filteredCredentials = credentials.filter(
    cred => cred.credential_type === selectedType
  );
  
  return (
    <Tabs defaultValue={selectedType} className="w-full">
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
              onDelete={onDelete}
              onShare={onShare}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{getEmptyMessage()}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => onAddCredential('academic')}
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
              onDelete={onDelete}
              onShare={onShare}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{getEmptyMessage()}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => onAddCredential('certification')}
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
              onDelete={onDelete}
              onShare={onShare}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{getEmptyMessage()}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => onAddCredential('experience')}
            >
              Add Work Experience
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CredentialWalletTabs;
