
import React from 'react';
import { Button } from "@/components/ui/button";

interface CredentialWalletHeaderProps {
  onAddCredential: () => void;
  onShare: () => void;
}

/**
 * Only the fixed navigation bar stays here.
 */
const CredentialWalletHeader: React.FC<CredentialWalletHeaderProps> = ({ onAddCredential, onShare }) => (
  <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      <div className="w-24" />
      <h1 className="text-2xl font-playfair text-primary font-bold">Credential Wallet</h1>
      <div className="w-24 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onAddCredential}>
          Add New
        </Button>
      </div>
    </div>
  </nav>
);

export default CredentialWalletHeader;

