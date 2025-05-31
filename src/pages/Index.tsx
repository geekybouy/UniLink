import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesCarousel from "@/components/landing/FeaturesCarousel";
import BenefitsSection from "@/components/landing/BenefitsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import LandingCTASection from "@/components/landing/LandingCTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900 text-white min-h-screen">
      <LandingHeader />
      <main>
        <HeroSection />
        <section id="features" className="relative z-10 bg-white text-gray-900 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <FeaturesCarousel />
          </div>
        </section>
        <section id="benefits" className="relative z-10 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-800 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <BenefitsSection />
          </div>
        </section>
        <section id="how-it-works" className="bg-white text-gray-900 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <HowItWorksSection />
          </div>
        </section>
        <section id="testimonials" className="bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900 text-white py-20 md:py-28">
          <div className="container mx-auto px-4">
            <TestimonialsSection />
          </div>
        </section>
        <section id="cta" className="relative z-10 bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <LandingCTASection />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
