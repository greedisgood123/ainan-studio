import { Play, Camera, Zap } from "lucide-react";
import { ToPortfolioButton } from "@/components/ui/to-portfolio-button";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import React from "react";

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
  const data = useQuery(api.gallery.listPublic, {});
  const iconMap: Record<string, any> = { Play, Camera, Zap };
  const fallback = [
    { title: "Tech Conference Live Stream", description: "Multi-camera setup for 1,000+ attendees with real-time streaming", badge: "Livefeed", iconName: "Play" },
    { title: "Corporate Headshot Session", description: "Professional headshots for 50+ executives in a single day", badge: "Photography", iconName: "Camera" },
    { title: "Wedding Live Coverage", description: "Complete ceremony and reception with cinematic highlights", badge: "Event Coverage", iconName: "Zap" },
  ];

  const items = React.useMemo(() => {
    try {
      const source = data && data.length > 0 ? data : fallback;
      return source.map((i: any) => ({
        title: i.title,
        description: i.description,
        badge: i.badge,
        Icon: iconMap[i.iconName] || Play,
        imageUrl: i.imageUrl, // server returns signed url when available
      }));
    } catch (err) {
      // Fallback to static items on any unexpected error
      return fallback.map((i: any) => ({
        title: i.title,
        description: i.description,
        badge: i.badge,
        Icon: iconMap[i.iconName] || Play,
        imageUrl: undefined,
      }));
    }
  }, [data]);

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
          {items.map((work, index) => {
            const IconComponent = work.Icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-all duration-300 bg-white"
              >
                {/* Image area */}
                <div className="relative h-64 rounded-t-lg overflow-hidden">
                  {work.imageUrl ? (
                    <img
                      src={work.imageUrl}
                      alt={work.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        // Hide broken image to reveal placeholder background
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-gray-400 opacity-30">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                  )}

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