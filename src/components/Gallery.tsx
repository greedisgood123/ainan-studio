import { Play, Camera, Zap, ArrowRight, ArrowLeft, Eye, Heart } from "lucide-react";
import { ToPortfolioButton } from "@/components/ui/to-portfolio-button";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
type GalleryItem = {
  title: string;
  description: string;
  badge: string;
  Icon: React.ElementType;
  imageUrl?: string;
};

const CreativeGalleryTile = ({
  work,
  index,
  layoutType,
  onOpen,
}: {
  work: GalleryItem;
  index: number;
  layoutType: "hero" | "tall" | "wide" | "square";
  onOpen: () => void;
}) => {
  const IconComponent = work.Icon as any;
  const [loaded, setLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 120);
        }
      },
      { threshold: 0.1 }
    );
    if (tileRef.current) observer.observe(tileRef.current);
    return () => observer.disconnect();
  }, [index]);

  const getLayoutClasses = () => {
    switch (layoutType) {
      case "hero":
        return "md:col-span-2";
      case "tall":
        return "";
      case "wide":
        return "md:col-span-2";
      default:
        return "";
    }
  };

  const getAspectRatio = () => 3 / 2; // normalize all tiles to 3:2 for a coherent grid

  return (
    <div
      ref={tileRef}
      className={`group relative overflow-hidden bg-black/5 backdrop-blur-sm border border-white/10 transition-all duration-700 ease-out transform-gpu hover:scale-[1.02] hover:z-10 ${getLayoutClasses()}`}
      style={{
        borderRadius: index % 3 === 0 ? "2rem 0.5rem 2rem 0.5rem" : index % 2 === 0 ? "0.5rem 2rem 0.5rem 2rem" : "1rem",
        transform: isVisible ? "translateY(0)" : "translateY(2rem)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: `${getAspectRatio()}` }}>
        {work.imageUrl ? (
          <button type="button" className="absolute inset-0 group" onClick={onOpen} aria-label={`Open ${work.title}`}>
            {!loaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={work.imageUrl}
              srcSet={`${work.imageUrl}?w=640 640w, ${work.imageUrl}?w=768 768w, ${work.imageUrl}?w=1024 1024w`}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
              alt={work.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 will-change-transform"
              style={{ 
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'scale(1)' : 'scale(1.1)',
                transition: 'all 0.3s ease-in-out'
              }}
              onLoad={() => setLoaded(true)}
              onError={(e) => {
                console.warn('Failed to load image:', work.imageUrl);
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </button>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-white/20">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10 mix-blend-overlay" />

        {/* Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
            <IconComponent className="w-3 h-3" />
            {work.badge}
          </div>
        </div>

        {/* Icons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Eye className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Heart className="w-4 h-4" />
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="transform transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <h3 className="text-white font-bold mb-2 drop-shadow-lg" style={{
              fontSize: layoutType === "hero" ? "2rem" : layoutType === "tall" ? "1.5rem" : "1.25rem",
              lineHeight: "1.2",
            }}>
              {work.title}
            </h3>
            <p className="text-white/80 text-sm leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {work.description}
            </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-white/90 text-sm font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:text-white"
            onClick={onOpen}
          >
            <span>View More</span>
            <ArrowRight className="w-4 h-4 transition-transform md:group-hover:translate-x-1" />
          </button>
          </div>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-l-2 border-t-2 border-white/20 opacity-30 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 border-r-2 border-b-2 border-white/20 opacity-30 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
};

export const Gallery = () => {
  const data = useQuery(api.gallery.listPublic, {});
  const iconMap: Record<string, any> = { Play, Camera, Zap };
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const fallback = [
    { title: "Tech Conference Live Stream", description: "Multi-camera setup for 1,000+ attendees with real-time streaming", badge: "Livefeed", iconName: "Play" },
    { title: "Corporate Headshot Session", description: "Professional headshots for 50+ executives in a single day", badge: "Photography", iconName: "Camera" },
    { title: "Wedding Live Coverage", description: "Complete ceremony and reception with cinematic highlights", badge: "Event Coverage", iconName: "Zap" },
  ];

  const items = useMemo<GalleryItem[]>(() => {
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

  const getLayoutType = (_index: number): "hero" | "tall" | "wide" | "square" => "square";

  return (
    // Main section container with padding and background styling
    <section className="py-20 px-6 bg-[radial-gradient(1200px_800px_at_50%_-10%,hsl(var(--accent)/0.12),transparent_60%)]">
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

        {/* Uniform grid to reduce empty space and misalignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {items.map((work, index) => (
            <CreativeGalleryTile
              key={index}
              work={work}
              index={index}
              layoutType={getLayoutType(index)}
              onOpen={() => setCurrentIndex(index)}
            />
          ))}
        </div>

        {/* Call-to-action button */}
        <div className="text-center">
          <ToPortfolioButton />

        </div>
      </div>

      {/* Lightbox dialog with navigation */}
      <Dialog open={currentIndex !== null} onOpenChange={(open) => setCurrentIndex(open ? (currentIndex ?? 0) : null)}>
        <DialogContent
          className="p-0 sm:max-w-5xl bg-black"
          onKeyDown={(e) => {
            if (currentIndex === null) return;
            if (e.key === 'ArrowLeft') {
              setCurrentIndex((i) => (i === null ? i : (i + items.length - 1) % items.length));
            }
            if (e.key === 'ArrowRight') {
              setCurrentIndex((i) => (i === null ? i : (i + 1) % items.length));
            }
          }}
          tabIndex={0}
        >
          {currentIndex !== null && items[currentIndex] && (
            <div className="relative">
              <img
                src={items[currentIndex].imageUrl || ''}
                srcSet={`${items[currentIndex].imageUrl}?w=1280 1280w, ${items[currentIndex].imageUrl}?w=1920 1920w`}
                sizes="(max-width: 1280px) 100vw, 1920px"
                alt={items[currentIndex].title}
                className="w-full h-auto object-contain max-h-[80vh]"
                loading="eager"
                style={{ 
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
              {/* Prev/Next controls */}
              <button
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center"
                onClick={() => setCurrentIndex((i) => (i === null ? i : (i + items.length - 1) % items.length))}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center"
                onClick={() => setCurrentIndex((i) => (i === null ? i : (i + 1) % items.length))}
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              {/* Caption */}
              <div className="absolute bottom-3 left-4 right-4 text-white/90 text-sm">
                {items[currentIndex].title}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};