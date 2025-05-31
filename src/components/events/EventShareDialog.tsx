
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Linkedin, Mail, Twitter, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface EventShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventUrl: string;
}

export const EventShareDialog: React.FC<EventShareDialogProps> = ({
  open,
  onOpenChange,
  eventName,
  eventUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const shareText = `Join me at ${eventName}!`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join me at ${eventName}`);
    const body = encodeURIComponent(`I thought you might be interested in this event: ${eventName}\n\n${eventUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`);
  };

  const shareViaTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`);
  };

  const shareViaLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share This Event</DialogTitle>
          <DialogDescription>
            Invite your connections to join this event
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2">
          <Input
            readOnly
            value={eventUrl}
            className="flex-1"
          />
          <Button variant="outline" onClick={copyToClipboard}>
            {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center h-auto py-4"
            onClick={shareViaEmail}
          >
            <Mail className="h-6 w-6 mb-1 text-red-500" />
            <span className="text-xs">Email</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center h-auto py-4"
            onClick={shareViaFacebook}
          >
            <Facebook className="h-6 w-6 mb-1 text-blue-600" />
            <span className="text-xs">Facebook</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center h-auto py-4"
            onClick={shareViaTwitter}
          >
            <Twitter className="h-6 w-6 mb-1 text-blue-400" />
            <span className="text-xs">Twitter</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center h-auto py-4"
            onClick={shareViaLinkedin}
          >
            <Linkedin className="h-6 w-6 mb-1 text-blue-700" />
            <span className="text-xs">LinkedIn</span>
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
