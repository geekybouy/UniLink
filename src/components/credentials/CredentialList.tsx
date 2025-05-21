
import React from "react";
import CredentialItem from "@/components/credentials/CredentialItem";
import { Button } from "@/components/ui/button";
import type { Credential } from "@/types/credentials";

interface CredentialListProps {
  isLoading: boolean;
  credentials: Credential[];
  emptyMessage: string;
  onAddCredential: () => void;
  onDelete: (id: string) => Promise<void>;
  onShare: (id: string) => void;
  addButtonText: string;
}

const CredentialList: React.FC<CredentialListProps> = ({
  isLoading,
  credentials,
  emptyMessage,
  onAddCredential,
  onDelete,
  onShare,
  addButtonText,
}) => {
  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }
  if (!credentials.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
        <Button variant="outline" className="mt-4" onClick={onAddCredential}>
          {addButtonText}
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {credentials.map((credential) => (
        <CredentialItem
          key={credential.id}
          credential={credential}
          onDelete={onDelete}
          onShare={onShare}
        />
      ))}
    </div>
  );
};

export default CredentialList;

