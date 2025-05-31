import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

const AuthLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Add debug logs
  useEffect(() => {
    console.log('AuthLayout - Auth state:', { 
      isLoading, 
      isAuthenticated: !!user, 
      userId: user?.id,
      path: location.pathname
    });
  }, [isLoading, user, location.pathname]);

  // If authentication is still loading and this is NOT the callback page, show loading screen
  if (isLoading && !location.pathname.includes('/auth/callback')) {
    return (
      <div className="min-h-screen w-full max-w-full bg-gradient-to-b from-secondary/50 to-background flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-md flex flex-col items-center px-4">
          <h1 className="text-4xl font-playfair text-primary text-center mb-8">
            UniLink
          </h1>
          
          <div className="flex flex-col items-center justify-center p-8">
            <Spinner />
            <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is already authenticated and not on callback page, redirect to dashboard
  if (user && !location.pathname.includes('/callback')) {
    console.log('User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full max-w-full bg-gradient-to-b from-secondary/50 to-background flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full max-w-md px-4 py-8">
        <h1 className="text-4xl font-playfair text-primary text-center mb-8 transition-colors">
          UniLink
        </h1>
        
        <div className="bg-card shadow-lg rounded-lg border border-border/60 animate-fade-in">
          <Outlet />
        </div>
        
        <p className="text-center mt-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} UniLink. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
