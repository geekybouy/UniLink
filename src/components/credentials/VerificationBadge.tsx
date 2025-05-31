
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

export interface VerificationBadgeProps {
  status: 'verified' | 'failed' | 'pending' | 'not_verified';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  pulsate?: boolean;
  onClick?: () => void;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'md',
  showLabel = false,
  className,
  pulsate = false,
  onClick,
}) => {
  const statusConfig = {
    verified: {
      icon: CheckCircle,
      label: 'Verified',
      color: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800',
      hoverColor: 'hover:bg-green-200 dark:hover:bg-green-900/60',
      description: 'This credential has been verified and is valid.',
    },
    failed: {
      icon: XCircle,
      label: 'Failed Verification',
      color: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800',
      hoverColor: 'hover:bg-red-200 dark:hover:bg-red-900/60',
      description: 'This credential failed verification. It may be fraudulent or tampered with.',
    },
    pending: {
      icon: Clock,
      label: 'Pending Verification',
      color: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800',
      hoverColor: 'hover:bg-amber-200 dark:hover:bg-amber-900/60',
      description: 'This credential is currently being verified.',
    },
    not_verified: {
      icon: Shield,
      label: 'Not Verified',
      color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700',
      hoverColor: 'hover:bg-gray-200 dark:hover:bg-gray-800/60',
      description: 'This credential has not been submitted for verification.',
    },
  };
  
  const sizeConfig = {
    sm: {
      paddingX: showLabel ? 'px-2' : 'px-1',
      paddingY: 'py-0.5',
      iconSize: 'h-3 w-3',
      fontSize: 'text-xs',
      gap: 'gap-1',
    },
    md: {
      paddingX: showLabel ? 'px-3' : 'px-1.5',
      paddingY: 'py-1',
      iconSize: 'h-4 w-4',
      fontSize: 'text-sm',
      gap: 'gap-1.5',
    },
    lg: {
      paddingX: showLabel ? 'px-4' : 'px-2',
      paddingY: 'py-1.5',
      iconSize: 'h-5 w-5',
      fontSize: 'text-base',
      gap: 'gap-2',
    },
  };
  
  const StatusIcon = statusConfig[status].icon;
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'inline-flex items-center rounded-full border',
            sizeConfig[size].paddingX,
            sizeConfig[size].paddingY,
            sizeConfig[size].gap,
            statusConfig[status].color,
            statusConfig[status].hoverColor,
            onClick && 'cursor-pointer',
            className
          )}
          onClick={onClick}
        >
          <motion.div
            animate={pulsate ? {
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            } : {}}
            transition={pulsate ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            } : {}}
          >
            <StatusIcon className={sizeConfig[size].iconSize} />
          </motion.div>
          
          {showLabel && (
            <span className={sizeConfig[size].fontSize + ' font-medium'}>
              {statusConfig[status].label}
            </span>
          )}
        </motion.div>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-64">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{statusConfig[status].label}</h4>
            <p className="text-sm">
              {statusConfig[status].description}
            </p>
            {status === 'verified' && (
              <p className="text-xs text-muted-foreground pt-1">
                Verified using blockchain technology for tamper-proof validation.
              </p>
            )}
            {status === 'pending' && (
              <p className="text-xs text-muted-foreground pt-1">
                Verification usually takes 1-2 business days.
              </p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default VerificationBadge;
