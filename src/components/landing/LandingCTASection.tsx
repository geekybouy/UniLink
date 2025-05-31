import React from "react";
import { Button } from "@/components/ui/button";

const LandingCTASection = () => (
  <div className="text-center flex flex-col items-center max-w-2xl mx-auto">
    <h3 className="text-3xl md:text-4xl font-bold mb-5 text-primary-900">
      Ready to transform your professional future?
    </h3>
    <p className="text-xl text-gray-700 mb-10">
      Unlock verified credentials and join the trusted alumni network.
    </p>
    <Button
      asChild
      className="bg-gradient-to-r from-blue-700 to-purple-500 text-white text-lg px-10 py-5 rounded-full shadow-lg transition-all hover:from-blue-600 hover:to-purple-700"
      size="lg"
    >
      <a href="/auth/signup">Get Started</a>
    </Button>
  </div>
);

export default LandingCTASection;
