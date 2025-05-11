
import { useState, useEffect, useCallback, memo } from 'react';

const slides = [
  {
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
  },
  {
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200",
  },
  {
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
  }
];

// Add image preloading function
const preloadImages = () => {
  slides.forEach(slide => {
    const img = new Image();
    img.src = slide.image;
  });
};

const ImageSlider = memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload images once component mounts
  useEffect(() => {
    preloadImages();
    setIsLoaded(true);
  }, []);

  // Memoize the slide transition function
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  // Set up the interval for slides
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Initial loading state
  if (!isLoaded) {
    return (
      <div className="h-[600px] w-full bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img
            src={slide.image}
            alt="University alumni networking"
            className="h-full w-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
    </div>
  );
});

ImageSlider.displayName = 'ImageSlider';

export default ImageSlider;
