
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ManualAuthFormProps {
  isLogin: boolean;
  className?: string;
}

const ManualAuthForm: React.FC<ManualAuthFormProps> = ({ isLogin, className }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signInWithEmail, signUpWithEmail, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If already loading, don't submit again
    if (loading) return;
    
    // Reset error state
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        toast({
          title: "Login successful",
          description: "Welcome back to UniLink!",
        });
        // No need to navigate here, the auth state will trigger the redirect
      } else {
        if (!fullName || fullName.trim().length === 0) {
          throw new Error("Please enter your full name");
        }
        
        await signUpWithEmail(email, password, fullName);
        toast({
          title: "Account created",
          description: "Your account has been successfully created. Please complete your profile.",
        });
        navigate('/profile-setup');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      const errorMessage = err.message || 'Authentication failed. Please try again.';
      setError(errorMessage);
      
      // Only show toast for non-validation errors
      if (!errorMessage.includes("Please enter")) {
        toast({
          title: "Authentication failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= 6;
  const isValidForm = isLogin 
    ? isValidEmail && isValidPassword
    : isValidEmail && isValidPassword && fullName.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error && error.includes("full name")) setError(null);
              }}
              required
              placeholder="John Doe"
              autoComplete="name"
              className={error?.includes("full name") ? "border-destructive" : ""}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error && error.includes("email")) setError(null);
            }}
            required
            placeholder="your@email.com"
            autoComplete={isLogin ? "email" : "email"}
            className={error?.includes("email") ? "border-destructive" : ""}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error && error.includes("password")) setError(null);
            }}
            required
            placeholder="••••••••"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={6}
            className={error?.includes("password") ? "border-destructive" : ""}
          />
          {!isLogin && (
            <p className="text-xs text-muted-foreground mt-1">
              Password must be at least 6 characters long
            </p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-2"
          disabled={loading || !isValidForm}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" /> 
              {isLogin ? 'Logging in...' : 'Creating account...'}
            </>
          ) : (
            isLogin ? 'Log in' : 'Create account'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ManualAuthForm;
