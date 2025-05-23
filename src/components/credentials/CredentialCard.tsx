
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CheckCircle, Clock, Download, Share2, AlertCircle, Info, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export interface CredentialCardProps {
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
  isExpandable?: boolean;
  onView?: (id: string) => void;
  onShare?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export const CredentialCard = ({
  id,
  title,
  issuer,
  issuerLogo,
  issueDate,
  expiryDate,
  credentialType,
  status,
  description,
  imageUrl,
  isExpandable = true,
  onView,
  onShare,
  onDownload,
}: CredentialCardProps) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  
  const statusConfig = {
    verified: {
      icon: CheckCircle,
      label: 'Verified',
      color: 'success',
      description: 'This credential has been verified and is valid.',
    },
    pending: {
      icon: Clock,
      label: 'Pending Verification',
      color: 'warning',
      description: 'This credential is waiting to be verified.',
    },
    expired: {
      icon: AlertCircle,
      label: 'Expired',
      color: 'destructive',
      description: 'This credential has expired.',
    },
    revoked: {
      icon: AlertCircle,
      label: 'Revoked',
      color: 'destructive',
      description: 'This credential has been revoked by the issuer.',
    },
  };
  
  const typeConfig = {
    academic: { label: 'Academic', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    professional: { label: 'Professional', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    certification: { label: 'Certification', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    award: { label: 'Award', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
  };
  
  const StatusIcon = statusConfig[status].icon;
  const statusColor = statusConfig[status].color;
  
  const handleCardClick = () => {
    if (isExpandable) {
      setIsFlipped(!isFlipped);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <motion.div 
      className="perspective-1000 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={cn(
          "relative w-full transform-style-3d transition-all duration-500",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front of card */}
        <Card 
          className={cn(
            "w-full backface-hidden hover:shadow-md transition-shadow cursor-pointer",
            isFlipped && "rotate-y-180 invisible"
          )}
          onClick={handleCardClick}
        >
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={issuerLogo} alt={issuer} />
                <AvatarFallback>{issuer[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{issuer}</p>
                <p className="text-xs text-muted-foreground">Issued: {formatDate(issueDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={typeConfig[credentialType].color}>
                {typeConfig[credentialType].label}
              </Badge>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className={`flex items-center rounded-full p-1 ${statusColor === 'success' ? 'bg-green-100 dark:bg-green-900' : statusColor === 'warning' ? 'bg-amber-100 dark:bg-amber-900' : 'bg-red-100 dark:bg-red-900'}`}>
                    <StatusIcon className={`h-5 w-5 ${statusColor === 'success' ? 'text-green-600 dark:text-green-400' : statusColor === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`} />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{statusConfig[status].label}</h4>
                      <p className="text-sm">
                        {statusConfig[status].description}
                      </p>
                      {expiryDate && (
                        <p className="text-xs text-muted-foreground pt-2">
                          {status === 'expired' ? 'Expired on:' : 'Expires on:'} {formatDate(expiryDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 pt-2">
            {imageUrl && (
              <div className="mb-3 relative rounded-md overflow-hidden">
                <AspectRatio ratio={16 / 9}>
                  <img 
                    src={imageUrl} 
                    alt={title} 
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="bg-black/70 text-white border-0">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            )}
            
            <h3 className="text-lg font-semibold leading-tight mb-2">{title}</h3>
            
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
            )}
          </CardContent>
          
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                onView?.(id);
              }}>
                View
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={(e) => {
                e.stopPropagation();
                onShare?.(id);
              }}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={(e) => {
                e.stopPropagation();
                onDownload?.(id);
              }}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
            
            {isExpandable && (
              <Button variant="ghost" size="sm">
                Details
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Back of card */}
        {isExpandable && (
          <Card 
            className={cn(
              "absolute top-0 left-0 w-full backface-hidden rotate-y-180",
              !isFlipped && "invisible"
            )}
            onClick={handleCardClick}
          >
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{issuer}</p>
                </div>
                <Badge className={typeConfig[credentialType].color}>
                  {typeConfig[credentialType].label}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Issue Date</p>
                    <p className="text-sm font-medium">{formatDate(issueDate)}</p>
                  </div>
                  {expiryDate && (
                    <div>
                      <p className="text-xs text-muted-foreground">Expiry Date</p>
                      <p className="text-sm font-medium">{formatDate(expiryDate)}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${statusColor === 'success' ? 'text-green-600' : statusColor === 'warning' ? 'text-amber-600' : 'text-red-600'}`} />
                    <span className="text-sm font-medium">{statusConfig[status].label}</span>
                  </div>
                </div>
                
                {description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{description}</p>
                  </div>
                )}
                
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Verification Information
                  </p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs font-mono break-all">
                      Credential ID: {id}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Verified using blockchain technology
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Button variant="outline" size="sm" onClick={(e) => {
                e.stopPropagation();
                onDownload?.(id);
              }}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => {
                e.stopPropagation();
                onShare?.(id);
              }}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </CardFooter>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CredentialCard;
