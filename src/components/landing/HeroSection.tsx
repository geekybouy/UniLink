
import React, { Suspense } from "react";
import AnimatedCredentialCards from "./AnimatedCredentialCards";

/**
 * Custom hero mesh background SVG for animated mesh effect.
 */
const MeshBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    style={{ zIndex: 0 }}
    viewBox="0 0 1600 850"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <defs>
      <radialGradient id="emerald-mesh" cx="25%" cy="40%" r="120%" fx="25%" fy="45%" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981" stopOpacity="0.90" />
        <stop offset="0.45" stopColor="#14B8A6" stopOpacity="0.85" />
        <stop offset="1" stopColor="#1F2937" stopOpacity="0.95" />
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#emerald-mesh)" />
    {/* Floating vector shapes */}
    <ellipse cx="250" cy="170" rx="110" ry="46" fill="#F59E0B" fillOpacity="0.15">
      <animate attributeName="cx" values="250;320;250" dur="15s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.15;0.33;0.15" dur="14s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="1350" cy="670" rx="64" ry="36" fill="#14B8A6" fillOpacity="0.23">
      <animate attributeName="cx" values="1350;1280;1350" dur="14s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.23;0.42;0.23" dur="13s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="1250" cy="150" rx="77" ry="30" fill="#F97316" fillOpacity="0.07">
      <animate attributeName="cy" values="150;210;150" dur="19s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="650" cy="650" rx="43" ry="22" fill="#F59E0B" fillOpacity="0.16">
      <animate attributeName="cy" values="650;620;650" dur="12s" repeatCount="indefinite"/>
    </ellipse>
  </svg>
);

const HeroSection = () => (
  <section className="relative w-full min-h-[90vh] flex items-center md:items-stretch justify-center bg-black/95 overflow-hidden pb-16 md:pb-0">
    <MeshBackground />
    {/* Mesh overlay for depth */}
    <div className="absolute inset-0 pointer-events-none z-0 backdrop-blur-sm" />
    <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto px-4 pt-32 pb-10 md:pt-36 md:pb-0 gap-y-16 md:gap-x-8">
      {/* Left: Heading and CTA */}
      <div className="flex-1 flex flex-col justify-center text-center md:text-left items-center md:items-start">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight font-sans tracking-tight mb-7">
          <span className="block bg-gradient-to-r from-[#10B981] via-[#14B8A6] to-[#F59E0B] text-transparent bg-clip-text pb-2 animate-fade-in">
            Transform Your Future
          </span>
          <span className="block text-white/90 font-bold animate-fade-in delay-100">
            with <span className="text-[#F59E0B] animate-glow">Verified Digital Credentials</span>
          </span>
        </h1>
        <p className="max-w-xl mx-auto md:mx-0 text-lg sm:text-2xl text-gray-100/90 font-light mb-8 animate-fade-in delay-150">
          Experience blockchain-powered careers. Showcase, verify, and share your achievements instantly with <span className="font-semibold text-[#14B8A6]">Unilink</span>.
        </p>
        <a 
          href="/auth/signup"
          className="inline-flex items-center shadow-xl px-9 py-4 rounded-full bg-gradient-to-r from-[#10B981] via-[#14B8A6] to-[#F97316] text-white text-lg font-bold tracking-wider uppercase transition-all ring-2 ring-[#F59E0B] hover:scale-105 hover:ring-4 animate-fade-in delay-200 neumorphic-btn"
          style={{
            boxShadow: "0 6px 36px 0 #10B98140, 0 1.5px 2px rgba(20,184,166,0.14)",
            letterSpacing: "0.06em"
          }}
        >
          Get Started
          <svg className="ml-3" width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
      </div>
      {/* Right: 3D Credential Card Animation */}
      <div className="flex-1 min-w-[320px] max-w-xl h-[340px] sm:h-[400px] md:h-[470px] lg:h-[540px] flex justify-center items-center animate-fade-in delay-300">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-black/10 rounded-xl" />}>
          <AnimatedCredentialCards />
        </Suspense>
      </div>
    </div>
    {/* Subtle surface glass effect at bottom */}
    <div className="absolute left-0 bottom-0 w-full h-[6vw] pointer-events-none bg-gradient-to-t from-[#111e] via-[#14B8A6]/25 to-transparent z-10" style={{filter:"blur(4px)"}}/>
    {/* SVG Noise overlay for premium polish */}
    <div className="absolute inset-0 z-20 pointer-events-none mix-blend-soft-light opacity-60" style={{backgroundImage:"url('https://www.transparenttextures.com/patterns/noise.png')"}} />
  </section>
);

export default HeroSection;
