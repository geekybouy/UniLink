
import React from 'react';
import { Toaster, toast } from 'sonner';
import { CheckCircle, AlertCircle, Info, Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface NotificationToastProps {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'notification';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export const showNotification = ({
  title,
  message,
  type = 'info',
  duration = 5000,
  action,
  onDismiss,
}: NotificationToastProps) => {
  return toast((
    <NotificationToastContent
      title={title}
      message={message}
      type={type}
      action={action}
      onDismiss={onDismiss}
    />
  ), {
    duration,
    id: `${type}-${Date.now()}`,
  });
};

const NotificationToastContent = ({
  title,
  message,
  type = 'info',
  action,
  onDismiss,
}: NotificationToastProps) => {
  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    notification: <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
  };
  
  const bgColorMap = {
    success: 'bg-green-50 dark:bg-green-950/30',
    error: 'bg-red-50 dark:bg-red-950/30',
    warning: 'bg-amber-50 dark:bg-amber-950/30',
    info: 'bg-blue-50 dark:bg-blue-950/30',
    notification: 'bg-indigo-50 dark:bg-indigo-950/30',
  };
  
  const borderColorMap = {
    success: 'border-green-200 dark:border-green-800',
    error: 'border-red-200 dark:border-red-800',
    warning: 'border-amber-200 dark:border-amber-800',
    info: 'border-blue-200 dark:border-blue-800',
    notification: 'border-indigo-200 dark:border-indigo-800',
  };
  
  return (
    <div className={cn(
      "w-full rounded-lg border p-4 flex gap-3 items-start",
      bgColorMap[type],
      borderColorMap[type]
    )}>
      <div className="flex-shrink-0 mt-0.5">
        {iconMap[type]}
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        {action && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={action.onClick}
              className="h-8"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
      {onDismiss && (
        <Button 
          variant="ghost" 
          size="icon-sm" 
          onClick={onDismiss}
          className="opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export const NotificationToaster = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          padding: 0,
          margin: 0,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        },
      }}
    />
  );
};

export default NotificationToaster;
