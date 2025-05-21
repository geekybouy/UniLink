
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, Share } from 'lucide-react';

interface CredentialWalletHeaderProps {
  onAddCredential: () => void;
  onShare: () => void;
}

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
          onClick={onShare}
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
  </nav>
);

export default CredentialWalletHeader;
