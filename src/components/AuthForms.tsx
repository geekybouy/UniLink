
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Chrome } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

const AuthForms = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { signInWithGoogle, isLoading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    await signInWithGoogle();
    setIsAuthenticating(false);
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
      
      <div className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full border-gray-300 hover:bg-gray-50"
          onClick={handleGoogleSignIn}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <Spinner />
          ) : (
            <>
              <Chrome className="mr-2 h-4 w-4" />
              {isLogin ? "Sign in with Google" : "Sign up with Google"}
            </>
          )}
        </Button>
      </div>
      
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
