
import React, { useRef, useEffect, useState } from "react";

const features = [
  {
    title: "Secure Digital Credentials",
    desc: "Store all your degrees, certifications, and achievements in one tamper-proof blockchain wallet.",
    img: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=680&q=80",
  },
  {
    title: "Smart Resume Builder",
    desc: "AI analyzes job requirements and optimizes your resume for maximum impact.",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&q=80",
  },
  {
    title: "Control Your Information",
    desc: "Share exactly what you want with specific employers while keeping other details private.",
    img: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=700&q=80",
  },
  {
    title: "Advanced Fraud Protection",
    desc: "AI-powered system detects fake credentials and ensures authenticity.",
    img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=700&q=80",
  },
  {
    title: "Automated Management",
    desc: "Never miss credential renewals with smart contract automation.",
    img: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=700&q=80",
  },
  {
    title: "Powerful Alumni Connections",
    desc: "Connect with fellow alumni and expand your professional network.",
    img: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=700&q=80",
  },
  {
    title: "Access Anywhere",
    desc: "Seamless experience across all your devices.",
    img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&q=80",
  },
  {
    title: "Universal Integration",
    desc: "Works with existing HR systems and university databases.",
    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=700&q=80",
  },
];

const AUTO_PLAY_INTERVAL = 4000;

function FeaturesCarousel() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-advance logic (pause on hover)
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % features.length);
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index]);

  const handleDotClick = (idx: number) => {
    setIndex(idx);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % features.length);
    }, AUTO_PLAY_INTERVAL);
  };

  return (
    <section 
      className="relative max-w-5xl mx-auto w-full"
      aria-label="Features carousel"
    >
      <div
        className="relative overflow-hidden rounded-3xl shadow-xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              i === index
                ? "opacity-100 translate-x-0 z-10"
                : "opacity-0 -translate-x-10 pointer-events-none z-0"
            }`}
            role={i === index ? "group" : undefined}
            aria-hidden={i !== index}
          >
            <div className="grid md:grid-cols-2 gap-10 items-center px-8 py-12 bg-gradient-to-br from-white via-neutral-100 to-white rounded-3xl shadow-xl min-h-[320px] md:min-h-[350px]">
              <div className="flex flex-col items-start">
                <h3 className="font-bold text-2xl md:text-3xl mb-3 text-blue-900">{feature.title}</h3>
                <p className="text-gray-700 text-lg mb-5">{feature.desc}</p>
              </div>
              <div className="flex justify-center items-center">
                <img
                  src={feature.img}
                  alt={feature.title + " illustration"}
                  className="w-72 h-72 object-cover rounded-xl border-2 border-primary/10 shadow-lg bg-gradient-to-tr from-blue-300/10 to-purple-300/10"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Carousel Dots */}
      <div className="flex justify-center mt-8 gap-3">
        {features.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all w-3.5 h-3.5 rounded-full border-2 border-primary mr-1 last:mr-0 ${
              idx === index
                ? "bg-gradient-to-r from-blue-700 to-purple-500 shadow-lg scale-110"
                : "bg-white/70 hover:bg-primary/30"
            }`}
            onClick={() => handleDotClick(idx)}
            aria-current={idx === index}
          />
        ))}
      </div>
    </section>
  );
}

export default FeaturesCarousel;
