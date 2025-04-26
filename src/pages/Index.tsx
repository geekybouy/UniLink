
import { useState } from 'react';
import ImageSlider from '../components/ImageSlider';
import AuthForms from '../components/AuthForms';
import { Button } from "@/components/ui/button";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);

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
            <div className="absolute bottom-12 left-0 right-0 flex justify-center z-30">
              <Button
                onClick={() => setShowAuth(true)}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full shadow-lg transition-transform hover:scale-105"
              >
                Get Started
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
