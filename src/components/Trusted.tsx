import { useEffect, useState } from "react";
import { clientLogo } from "@/assets/client-logo/client";

export const Trusted = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  // Auto-scroll animation with seamless loop
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        // Calculate the width of one complete set of logos
        const logoWidth = 128 + 32; // logo width + gap
        const totalWidth = logoWidth * clientLogo.length;
        
        // Reset to beginning when we've scrolled one complete set
        if (prev <= -totalWidth) {
          return 0;
        }
        return prev - 0.5; // Slower, smoother movement
      });
    }, 16); // 60fps for smoother animation

    return () => clearInterval(interval);
  }, []);

  // Create logo items with proper structure for infinite scroll
  // Duplicate the array 3 times to ensure seamless looping
  const logoItems = [...clientLogo, ...clientLogo, ...clientLogo].map((logo, index) => ({
    id: index,
    src: logo,
    name: `Client ${(index % clientLogo.length) + 1}`,
  }));

  return (
    <section className="py-12 md:py-16 px-4 md:px-6 bg-white border-b border-blue-200">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Trusted by Industry Leaders
          </h2>
        </div>

        {/* Auto-scrolling logos container */}
        <div className="relative overflow-hidden">
          <div 
            className="flex gap-8 items-center"
            style={{
              transform: `translateX(${scrollPosition}px)`,
              willChange: 'transform',
            }}
          >
            {/* Logo items */}
            {logoItems.map((logo) => (
              <div
                key={logo.id}
                className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-lg flex items-center justify-center border border-gray-200"
                style={{ minWidth: '96px' }}
              >
                <img
                  src={logo.src}
                  srcSet={`${logo.src} 400w`}
                  sizes="(max-width: 640px) 25vw, 128px"
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>

          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
        </div>
      </div>
    </section>
  );
};