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
      <DialogContent
        className="z-[100] bg-background border shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Credential QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6">
          <div className="bg-background p-4 rounded-md shadow-sm border">
            <QRCodeSVG 
              value={shareUrl} 
              size={200}
              bgColor="transparent"
              fgColor="#222"
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Scan this QR code to access the shared credentials.
            <br />All shared credentials are blockchain-verified for authenticity.
          </p>
        </div>
        <div className="flex justify-end">
          <Button className="text-foreground" onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ShareQRDialog;
