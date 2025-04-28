
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, ExternalLink } from "lucide-react";
import { format } from 'date-fns';

interface Credential {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  description: string;
  credential_type: 'academic' | 'certification' | 'experience';
  blockchain_hash: string | null;
  verification_status: 'pending' | 'verified' | 'expired';
}

interface CredentialItemProps {
  credential: Credential;
}

const CredentialItem: React.FC<CredentialItemProps> = ({ credential }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusBadge = () => {
    switch (credential.verification_status) {
      case 'verified':
        return <Badge variant="success" className="bg-green-500">Verified</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500">Pending</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const getCredentialIcon = () => {
    switch (credential.credential_type) {
      case 'academic':
        return <div className="bg-blue-100 p-2 rounded-full"><Shield className="h-5 w-5 text-blue-600" /></div>;
      case 'certification':
        return <div className="bg-purple-100 p-2 rounded-full"><Shield className="h-5 w-5 text-purple-600" /></div>;
      case 'experience':
        return <div className="bg-green-100 p-2 rounded-full"><Shield className="h-5 w-5 text-green-600" /></div>;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {getCredentialIcon()}
              <div>
                <CardTitle className="text-base">{credential.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{credential.issuer}</p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Issued:</span> {formatDate(credential.issue_date)}
            {credential.expiry_date && (
              <> · <span className="text-muted-foreground">Expires:</span> {formatDate(credential.expiry_date)}</>
            )}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex justify-between w-full">
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(true)}>
              View Details
            </Button>
            {credential.blockchain_hash && (
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <span className="text-xs">Verify</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{credential.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Issuer</h4>
              <p>{credential.issuer}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">Description</h4>
              <p className="text-sm">{credential.description}</p>
            </div>
            <div className="flex gap-x-6">
              <div>
                <h4 className="text-sm font-semibold mb-1">Issue Date</h4>
                <p>{formatDate(credential.issue_date)}</p>
              </div>
              {credential.expiry_date && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Expiry Date</h4>
                  <p>{formatDate(credential.expiry_date)}</p>
                </div>
              )}
            </div>
            {credential.blockchain_hash && (
              <div>
                <h4 className="text-sm font-semibold mb-1">Blockchain Verification</h4>
                <p className="text-xs font-mono break-all bg-gray-100 p-2 rounded">
                  {credential.blockchain_hash}
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Verify on Blockchain
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CredentialItem;
