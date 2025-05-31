
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EventPhoto } from '@/types/events';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EventPhotoGalleryProps {
  photos: EventPhoto[];
  eventId: string;
  onUpload: (file: File, caption: string) => Promise<void>;
  onDelete: (photoId: string) => Promise<void>;
}

export const EventPhotoGallery: React.FC<EventPhotoGalleryProps> = ({
  photos,
  eventId,
  onUpload,
  onDelete,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      setIsUploading(true);
    }
  };

  const handleUpload = async () => {
    if (!photoFile) return;

    try {
      setUploading(true);
      await onUpload(photoFile, photoCaption);
      setIsUploading(false);
      setPhotoFile(null);
      setPhotoCaption('');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoClick = (photo: EventPhoto) => {
    setSelectedPhoto(photo);
  };

  const handleDeleteClick = (photo: EventPhoto) => {
    setSelectedPhoto(photo);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPhoto) return;
    
    try {
      await onDelete(selectedPhoto.id);
      setIsDeleteDialogOpen(false);
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Event Photos</h2>
        <Button onClick={() => document.getElementById('upload-photo')?.click()} size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Upload Photo
        </Button>
        <input
          id="upload-photo"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      
      {/* Upload Dialog */}
      <Dialog open={isUploading} onOpenChange={setIsUploading}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Event Photo</DialogTitle>
            <DialogDescription>
              Share your photo from this event with other attendees.
            </DialogDescription>
          </DialogHeader>
          
          {photoFile && (
            <div className="aspect-video w-full overflow-hidden rounded-md">
              <img 
                src={URL.createObjectURL(photoFile)} 
                alt="Preview" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Add a caption to your photo"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsUploading(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!photoFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto && !isDeleteDialogOpen} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPhoto.caption || 'Event Photo'}</DialogTitle>
              </DialogHeader>
              <div className="w-full overflow-hidden rounded-md">
                <img 
                  src={selectedPhoto.photo_url} 
                  alt={selectedPhoto.caption || 'Event photo'} 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {selectedPhoto.uploaded_by === user?.id && (
                <DialogFooter>
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    size="sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Photo
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Photo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="relative aspect-square rounded-md overflow-hidden cursor-pointer group"
              onClick={() => handlePhotoClick(photo)}
            >
              <img 
                src={photo.photo_url} 
                alt={photo.caption || 'Event photo'} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              {photo.uploaded_by === user?.id && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(photo);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white text-sm truncate">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No photos have been uploaded yet.</p>
          <p className="text-sm">Be the first to share a photo from this event!</p>
        </div>
      )}
    </div>
  );
};
