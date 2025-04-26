
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Chrome } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import ManualAuthForm from './ManualAuthForm';
import { toast } from 'sonner';

const AuthForms = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { signInWithGoogle, isLoading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      toast.info('Redirecting to Google sign-in...');
      await signInWithGoogle();
      // Note: No need to set isAuthenticating to false here as we're redirecting
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setIsAuthenticating(false);
      // Error is already handled in signInWithGoogle function
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md p-6 flex items-center justify-center">
        <Spinner />
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-6 space-y-6 bg-white shadow-lg">
      <h2 className="text-3xl font-playfair text-center text-primary">
        {isLogin ? "Welcome Back" : "Join UniLink"}
      </h2>
      
      <Button 
        variant="outline" 
        className="w-full border-gray-300 hover:bg-gray-50 relative"
        onClick={handleGoogleSignIn}
        disabled={isAuthenticating}
      >
        {isAuthenticating ? (
          <span className="flex items-center justify-center">
            <Spinner />
            <span className="ml-2">Connecting to Google...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Chrome className="mr-2 h-4 w-4" />
            {isLogin ? "Sign in with Google" : "Sign up with Google"}
          </span>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <ManualAuthForm isLogin={isLogin} />
      
      <div className="text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary hover:underline"
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </Card>
  );
};

export default AuthForms;
