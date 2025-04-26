
import { useState, useEffect } from 'react';

const slides = [
  {
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80",
    title: "Connect with Alumni",
    description: "Network with graduates from your university"
  },
  {
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80",
    title: "Search Alumni Profiles",
    description: "Find and connect with professionals in your field"
  },
  {
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80",
    title: "Instant Messaging",
    description: "Stay connected with real-time conversations"
  }
];

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[600px] w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white">
            <h2 className="text-4xl md:text-5xl font-playfair mb-4">{slide.title}</h2>
            <p className="text-lg md:text-xl">{slide.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageSlider;
