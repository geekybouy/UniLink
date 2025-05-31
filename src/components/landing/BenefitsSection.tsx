
import React from "react";
import { ShieldCheck, Briefcase, Rocket } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Trusted by Universities",
    description: "Unilink partners with leading institutions to bring you verified, authentic credentials.",
  },
  {
    icon: Briefcase,
    title: "Employer Verified",
    description: "Recognized by top companies and recruiters around the world for secure hiring.",
  },
  {
    icon: Rocket,
    title: "Future-Proof Career",
    description: "Stay ahead with blockchain technology and unlock global career opportunities.",
  },
];

function BenefitsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {benefits.map(({ icon: Icon, title, description }, i) => (
        <div
          key={title}
          className="flex flex-col items-center text-center bg-white/10 rounded-2xl shadow-soft-lg p-8 transition-transform hover:scale-105 hover:shadow-xl"
        >
          <Icon className="w-12 h-12 text-blue-300 mb-5 drop-shadow" />
          <h4 className="text-2xl font-semibold mb-3 font-sans">{title}</h4>
          <p className="text-white/90 text-base font-light">{description}</p>
        </div>
      ))}
    </div>
  );
}

export default BenefitsSection;
