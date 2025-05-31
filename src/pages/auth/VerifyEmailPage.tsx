
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';

const VerifyEmailPage = () => {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
        <CardDescription className="text-center">
          Check your email to verify your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <MailCheck className="h-8 w-8 text-primary" />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            We've sent a verification email to your inbox. Please click the link in the email to verify your account.
          </p>
          <p className="text-sm text-muted-foreground">
            If you don't see it, check your spam folder or try logging in again.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button variant="outline" asChild className="w-full">
          <Link to="/auth/login">
            Return to login
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VerifyEmailPage;
