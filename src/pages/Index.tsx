
import { useState } from 'react';
import ImageSlider from '../components/ImageSlider';
import AuthForms from '../components/AuthForms';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user, firebaseUser, isLoading } = useAuth();

  // Redirect authenticated users to dashboard
  if (!isLoading && (user || firebaseUser)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-4xl font-playfair text-primary text-center">
            UniLink
          </h1>
        </div>
      </header>

      <main>
        {!showAuth ? (
          <div className="relative">
            <ImageSlider />
            <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center z-30 space-y-4">
              <Button
                onClick={() => setShowAuth(true)}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full shadow-lg transition-transform hover:scale-105"
              >
                Get Started
              </Button>
              <p className="text-sm text-gray-600 bg-white/80 px-4 py-2 rounded-full">
                Test account: testuser@example.com / Test@1234
              </p>
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
