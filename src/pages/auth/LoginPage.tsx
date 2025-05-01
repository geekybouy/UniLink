
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ManualAuthForm from '@/components/ManualAuthForm';
import AuthForms from '@/components/AuthForms';

const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">UniLink</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Sign in to your account
          </p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Log in</CardTitle>
            <CardDescription>
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>
          
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <AuthForms />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
            <ManualAuthForm isLogin={true} />
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <div className="mt-2 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/auth/signup" className="underline text-primary hover:text-primary/80">
                Sign up
              </Link>
            </div>
            <div className="mt-2 text-center text-sm">
              <Link to="/auth/forgot-password" className="underline text-primary hover:text-primary/80">
                Forgot password?
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
