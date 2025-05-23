
import React from 'react';
import CredentialCard from './CredentialCard';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Credential {
  id: string;
  title: string;
  issuer: string;
  issuerLogo?: string;
  issueDate: string;
  expiryDate?: string;
  credentialType: 'academic' | 'professional' | 'certification' | 'award';
  status: 'verified' | 'pending' | 'expired' | 'revoked';
  description?: string;
  imageUrl?: string;
}

interface CredentialGridProps {
  credentials: Credential[];
  columns?: 1 | 2 | 3 | 4;
  onView?: (id: string) => void;
  onShare?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const CredentialGrid: React.FC<CredentialGridProps> = ({
  credentials,
  columns = 3,
  onView,
  onShare,
  onDownload
}) => {
  const { toast } = useToast();
  const [selectedCredential, setSelectedCredential] = React.useState<Credential | null>(null);
  
  const handleView = (id: string) => {
    const credential = credentials.find(c => c.id === id);
    if (credential) {
      setSelectedCredential(credential);
    }
    
    if (onView) {
      onView(id);
    }
  };
  
  const handleShare = (id: string) => {
    toast({
      title: "Sharing credential",
      description: "Opening share dialog for credential ID: " + id,
    });
    
    if (onShare) {
      onShare(id);
    }
  };
  
  const handleDownload = (id: string) => {
    toast({
      title: "Downloading credential",
      description: "Starting download for credential ID: " + id,
    });
    
    if (onDownload) {
      onDownload(id);
    }
  };
  
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];
  
  return (
    <>
      <div className={`grid ${gridColsClass} gap-4 md:gap-6`}>
        {credentials.map((credential) => (
          <CredentialCard
            key={credential.id}
            {...credential}
            onView={handleView}
            onShare={handleShare}
            onDownload={handleDownload}
          />
        ))}
      </div>
      
      <Dialog open={!!selectedCredential} onOpenChange={() => setSelectedCredential(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedCredential && (
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-4">{selectedCredential.title}</h2>
              <div className="space-y-4">
                <img
                  src={selectedCredential.imageUrl || 'https://via.placeholder.com/800x450?text=Certificate'}
                  alt={selectedCredential.title}
                  className="w-full h-auto rounded-lg object-cover"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">Issuer</h3>
                    <p>{selectedCredential.issuer}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">Issue Date</h3>
                    <p>{new Date(selectedCredential.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">Credential Type</h3>
                    <p className="capitalize">{selectedCredential.credentialType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">Status</h3>
                    <p className="capitalize">{selectedCredential.status}</p>
                  </div>
                </div>
                
                {selectedCredential.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">Description</h3>
                    <p>{selectedCredential.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CredentialGrid;
