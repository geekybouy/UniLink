
import React from "react";
import { UploadCloud, CheckCircle, Users, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    title: "Upload Your Credentials",
    description: "Add your degrees and certifications quickly and securely.",
  },
  {
    icon: CheckCircle,
    title: "Get Verified",
    description: "Credentials are validated on the blockchain for unmatched authenticity.",
  },
  {
    icon: Users,
    title: "Connect & Share",
    description: "Network with alumni, employers, and institutions worldwide.",
  },
  {
    icon: TrendingUp,
    title: "Advance Your Career",
    description: "Leverage your verified credentials to unlock new opportunities.",
  },
];

const HowItWorksSection = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
    {steps.map(({ icon: Icon, title, description }) => (
      <div key={title} className="flex flex-col items-center text-center">
        <div className="bg-blue-700/10 rounded-full p-5 mb-5">
          <Icon className="w-10 h-10 text-purple-600" />
        </div>
        <h5 className="text-lg font-bold mb-2 text-blue-900">{title}</h5>
        <p className="text-base text-gray-700">{description}</p>
      </div>
    ))}
  </div>
);

export default HowItWorksSection;
