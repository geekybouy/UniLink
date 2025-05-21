import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Shield, Briefcase } from 'lucide-react';
import CredentialItem from '@/components/credentials/CredentialItem';
import { Button } from "@/components/ui/button";
import type { Credential } from '@/types/credentials';
import CredentialList from "./CredentialList";

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
  // Move the filter to be calculated per tab for true separation of tab state
  return (
    <Tabs defaultValue={selectedType} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="academic" onClick={() => setSelectedType("academic")}>
          <BookOpen className="h-4 w-4 mr-2" />
          Academic
        </TabsTrigger>
        <TabsTrigger value="certification" onClick={() => setSelectedType("certification")}>
          <Shield className="h-4 w-4 mr-2" />
          Certifications
        </TabsTrigger>
        <TabsTrigger value="experience" onClick={() => setSelectedType("experience")}>
          <Briefcase className="h-4 w-4 mr-2" />
          Experience
        </TabsTrigger>
      </TabsList>
      <TabsContent value="academic">
        <CredentialList
          isLoading={isLoading}
          credentials={credentials.filter((c) => c.credential_type === "academic")}
          emptyMessage={getEmptyMessage()}
          onAddCredential={() => onAddCredential("academic")}
          onDelete={onDelete}
          onShare={onShare}
          addButtonText="Add Academic Credential"
        />
      </TabsContent>
      <TabsContent value="certification">
        <CredentialList
          isLoading={isLoading}
          credentials={credentials.filter((c) => c.credential_type === "certification")}
          emptyMessage={getEmptyMessage()}
          onAddCredential={() => onAddCredential("certification")}
          onDelete={onDelete}
          onShare={onShare}
          addButtonText="Add Professional Certification"
        />
      </TabsContent>
      <TabsContent value="experience">
        <CredentialList
          isLoading={isLoading}
          credentials={credentials.filter((c) => c.credential_type === "experience")}
          emptyMessage={getEmptyMessage()}
          onAddCredential={() => onAddCredential("experience")}
          onDelete={onDelete}
          onShare={onShare}
          addButtonText="Add Work Experience"
        />
      </TabsContent>
    </Tabs>
  );
};

export default CredentialWalletTabs;
