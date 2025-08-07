import { Play, Camera, Zap } from "lucide-react";
import { ToPortfolioButton } from "@/components/ui/to-portfolio-button";

/**
 * Gallery Component - Displays featured work in a card layout
 * 
 * Features:
 * - Three content cards with image placeholders
 * - Service type badges with icons
 * - Professional titles and descriptions
 * - Call-to-action button
 * - Responsive design
 */
export const Gallery = () => {
  const featuredWork = [
    {
      title: "Tech Conference Live Stream",
      description: "Multi-camera setup for 1,000+ attendees with real-time streaming",
      badge: "Livefeed",
      icon: Play,
    },
    {
      title: "Corporate Headshot Session",
      description: "Professional headshots for 50+ executives in a single day",
      badge: "Photography",
      icon: Camera,
    },
    {
      title: "Wedding Live Coverage",
      description: "Complete ceremony and reception with cinematic highlights",
      badge: "Event Coverage",
      icon: Zap,
    },
  ];

  return (
    // Main section container with padding and background styling
    <section className="py-20 px-6 bg-background">
      {/* Centered container with max width for better readability */}
      <div className="max-w-7xl mx-auto">
        
        {/* Section header with title and description */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Featured Work
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Showcasing our expertise in delivering exceptional livestreaming and photography services across Malaysia
          </p>
        </div>

        {/* Cards container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {featuredWork.map((work, index) => {
            const IconComponent = work.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-all duration-300 bg-white"
              >
                {/* Image placeholder area */}
                <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300">
                  {/* Placeholder icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 text-gray-400 opacity-30">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <IconComponent className="w-3 h-3" />
                      {work.badge}
                    </div>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {work.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {work.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call-to-action button */}
        <div className="text-center">
          <ToPortfolioButton />

        </div>
      </div>
    </section>
  );
};