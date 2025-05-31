
import { useState, FormEvent } from 'react';
import { useMessaging } from '@/contexts/MessagingContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';

export const MessageInput = ({ recipientId }: { recipientId: string }) => {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { sendMessage } = useMessaging();
  const { user } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const trimmedMessage = message.trim();
    if (!trimmedMessage && !attachment) return;

    try {
      let attachmentUrl = undefined;

      // Upload attachment if any
      if (attachment) {
        setIsUploading(true);

        const fileExt = attachment.name.split('.').pop();
        const fileName = `${uuidv4()}-${Date.now()}.${fileExt}`;
        const filePath = `messages/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase
          .storage
          .from('user-content')
          .upload(filePath, attachment);

        if (uploadError) throw uploadError;

        const { data } = supabase
          .storage
          .from('user-content')
          .getPublicUrl(filePath);

        attachmentUrl = data.publicUrl;
      }

      // Send message with attachment URL if any
      await sendMessage(recipientId, trimmedMessage || '📎', attachmentUrl);

      // Reset form
      setMessage('');
      setAttachment(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAttachment(files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-3 bg-white dark:bg-background">
      {attachment && (
        <div className="mb-2 p-2 border rounded flex items-center justify-between bg-muted">
          <div className="text-sm truncate flex-1">{attachment.name}</div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAttachment(null)}
          >
            &times;
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-none">
          <label htmlFor="attachment" className="cursor-pointer">
            <div className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition-colors">
              <Paperclip className="h-5 w-5 text-gray-500 dark:text-muted-foreground" />
            </div>
            <input
              id="attachment"
              type="file"
              className="hidden"
              onChange={handleAttachment}
              accept="image/*,.pdf,.doc,.docx"
            />
          </label>
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 min-h-[60px] max-h-32 resize-none"
          disabled={isUploading}
        />

        <Button
          type="submit"
          size="icon"
          disabled={(!message.trim() && !attachment) || isUploading}
          className="flex-none"
        >
          {isUploading ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
};

