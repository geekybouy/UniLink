import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { toast } from 'sonner';

interface ShareLinkDialogProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
}

const ShareLinkDialog = ({ open, onClose, shareUrl }: ShareLinkDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="z-[100] bg-background border shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Share Your Credentials</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Share this secure link with employers, schools, or anyone else who needs to verify your credentials.
          </p>
          <div className="flex space-x-2">
            <Input 
              value={shareUrl} 
              readOnly 
              className="font-mono text-xs bg-muted text-foreground"
            />
            <Button 
              size="icon" 
              variant="outline" 
              onClick={handleCopy}
              className="text-foreground"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground pt-2">
            <p className="font-medium">Security Notice:</p>
            <p>This link provides access only to the credentials you selected.</p>
            <p>All shared credentials are blockchain-verified for authenticity.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button className="text-foreground" onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ShareLinkDialog;
