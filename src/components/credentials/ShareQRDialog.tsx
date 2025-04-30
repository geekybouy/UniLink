
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from 'qrcode.react';

interface ShareQRDialogProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
}

const ShareQRDialog = ({ open, onClose, shareUrl }: ShareQRDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credential QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <QRCodeSVG 
              value={shareUrl} 
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/placeholder.svg",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Scan this QR code to access the shared credentials.
            <br />All shared credentials are blockchain-verified for authenticity.
          </p>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareQRDialog;
