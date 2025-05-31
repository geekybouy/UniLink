
import React from "react";

const testimonials = [
  {
    name: "Sarah Lee, Alumni",
    quote:
      "With Unilink, sharing my credentials during job applications is instant and trustworthy. I landed interviews with confidence.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "Product Manager",
  },
  {
    name: "Michael Yu, Employer",
    quote:
      "Unilink makes background verification seamless. No more uncertainty – I can trust every profile I see.",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    role: "Recruiter, FastHire Inc.",
  },
  {
    name: "Dr. Ava Smith, University",
    quote:
      "As a partner institution, we know Unilink empowers our graduates with globally recognized digital credentials.",
    avatar: "https://randomuser.me/api/portraits/women/15.jpg",
    role: "Director, Global University",
  },
];

const TestimonialsSection = () => (
  <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
    {testimonials.map(({ name, avatar, quote, role }) => (
      <div
        key={name}
        className="bg-white/10 rounded-xl shadow-soft p-7 flex flex-col items-center text-center animate-fade-in"
      >
        <img
          src={avatar}
          alt={name}
          className="w-16 h-16 rounded-full border-4 border-primary mb-4"
        />
        <blockquote className="text-lg italic mb-3 text-white/90">"{quote}"</blockquote>
        <div className="text-base font-semibold text-white">{name}</div>
        <div className="text-xs font-normal text-white/70">{role}</div>
      </div>
    ))}
  </div>
);

export default TestimonialsSection;
