
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageSlider from '../components/ImageSlider';
import AuthForms from '../components/AuthForms';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user, isLoading } = useAuth();

  // Redirect authenticated users to dashboard
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-playfair text-primary">
              UniLink
            </h1>
            <div className="space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {!showAuth ? (
          <div className="relative">
            <ImageSlider />
            <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center z-30 space-y-4">
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full shadow-lg transition-transform hover:scale-105"
              >
                <Link to="/auth/signup">
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
            <AuthForms />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
