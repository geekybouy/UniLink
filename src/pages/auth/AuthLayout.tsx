
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

const AuthLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // If user is already authenticated, redirect to dashboard
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-playfair text-primary text-center mb-8">
          UniLink
        </h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Spinner size="lg" />
            <p className="mt-4 text-muted-foreground">Loading authentication...</p>
          </div>
        ) : (
          <Outlet />
        )}
        
        <p className="text-center mt-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} UniLink. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
