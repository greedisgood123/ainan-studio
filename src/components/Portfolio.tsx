import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import galleryImages from "@/assets/imagesCarousel";

export const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Weddings", "Corporate", "Livefeed", "Portraits", "Events"];
  
  // Static portfolio data - no backend needed
  const staticPortfolioData = [
    {
      id: "1",
      title: "Tech Conference Live Stream",
      description: "Multi-camera setup for 1,000+ attendees with real-time streaming and interactive Q&A sessions.",
      category: "Livefeed",
      coverUrl: galleryImages[9], // 0FK_0696.webp
      photos: [
        galleryImages[9], // 0FK_0696.webp
        galleryImages[1], // AIN00523.webp
        galleryImages[5]  // FKP03731.webp
      ]
    },
    {
      id: "2",
      title: "Corporate Headshot Session",
      description: "Professional headshots for 50+ executives in a single day, maintaining consistent quality across all team members.",
      category: "Corporate",
      coverUrl: galleryImages[1], // AIN00523.webp
      photos: [
        galleryImages[1], // AIN00523.webp
        galleryImages[2], // AIN00718.webp
        galleryImages[4]  // DSC_3411.webp
      ]
    },
    {
      id: "3",
      title: "Wedding Live Coverage",
      description: "Complete ceremony and reception with cinematic highlights, capturing every precious moment of the special day.",
      category: "Weddings",
      coverUrl: galleryImages[5], // FKP03731.webp
      photos: [
        galleryImages[5], // FKP03731.webp
        galleryImages[6], // FKP03833.webp
        galleryImages[7]  // FKP03935.webp
      ]
    },
    {
      id: "4",
      title: "Product Launch Event",
      description: "High-end product photography and live streaming for brand launch, reaching global audience in real-time.",
      category: "Events",
      coverUrl: galleryImages[2], // AIN00718.webp
      photos: [
        galleryImages[2], // AIN00718.webp
        galleryImages[8], // 0FK_1526.webp
        galleryImages[1]  // AIN00523.webp
      ]
    },
    {
      id: "5",
      title: "Corporate Training Session",
      description: "Multi-location training session with interactive Q&A, ensuring seamless knowledge transfer across teams.",
      category: "Livefeed",
      coverUrl: galleryImages[4], // DSC_3411.webp
      photos: [
        galleryImages[4], // DSC_3411.webp
        galleryImages[5], // FKP03731.webp
        galleryImages[9]  // 0FK_0696.webp
      ]
    },
    {
      id: "6",
      title: "Award Ceremony Coverage",
      description: "Red carpet photography and live award ceremony streaming, capturing the glamour and excitement of the event.",
      category: "Events",
      coverUrl: galleryImages[6], // FKP03833.webp
      photos: [
        galleryImages[6], // FKP03833.webp
        galleryImages[7], // FKP03935.webp
        galleryImages[2]  // AIN00718.webp
      ]
    },
    {
      id: "7",
      title: "Executive Portrait Session",
      description: "Premium portrait photography for C-level executives, creating powerful personal branding images.",
      category: "Portraits",
      coverUrl: galleryImages[7], // FKP03935.webp
      photos: [
        galleryImages[7], // FKP03935.webp
        galleryImages[1], // AIN00523.webp
        galleryImages[4]  // DSC_3411.webp
      ]
    },
    {
      id: "8",
      title: "Team Building Event",
      description: "Dynamic coverage of corporate team building activities, showcasing company culture and employee engagement.",
      category: "Corporate",
      coverUrl: galleryImages[8], // 0FK_1526.webp
      photos: [
        galleryImages[8], // 0FK_1526.webp
        galleryImages[5], // FKP03731.webp
        galleryImages[2]  // AIN00718.webp
      ]
    },
    {
      id: "9",
      title: "Intimate Wedding Ceremony",
      description: "Breathtaking coverage of intimate wedding ceremonies, focusing on emotional moments and personal touches.",
      category: "Weddings",
      coverUrl: galleryImages[1], // AIN00523.webp
      photos: [
        galleryImages[1], // AIN00523.webp
        galleryImages[6], // FKP03833.webp
        galleryImages[9]  // 0FK_0696.webp
      ]
    },
    {
      id: "10",
      title: "Studio Photography Session",
      description: "Professional studio photography with controlled lighting and perfect backdrops for corporate branding.",
      category: "Portraits",
      coverUrl: galleryImages[3], // Amin-Rashidi-Studio-664.webp
      photos: [
        galleryImages[3], // Amin-Rashidi-Studio-664.webp
        galleryImages[0], // 20191208-LAN_0281.webp
        galleryImages[1]  // AIN00523.webp
      ]
    },
    {
      id: "11",
      title: "Corporate Event Photography",
      description: "Comprehensive coverage of corporate events, conferences, and business meetings with professional documentation.",
      category: "Corporate",
      coverUrl: galleryImages[0], // 20191208-LAN_0281.webp
      photos: [
        galleryImages[0], // 20191208-LAN_0281.webp
        galleryImages[2], // AIN00718.webp
        galleryImages[4]  // DSC_3411.webp
      ]
    }
  ];

  const items = useMemo(
    () => {
      const allItems = staticPortfolioData.map((i: any) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        category: i.category,
        coverUrl: i.coverUrl,
        photos: i.photos
      }));
      
      // Filter by category if not "All"
      if (activeFilter === "All") {
        return allItems;
      }
      return allItems.filter(item => item.category === activeFilter);
    },
    [activeFilter]
  );

  // Lightbox state
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const isLightboxOpen = activeAlbumId !== null;
  
  // Get photos for the active album
  const activeAlbum = items.find(item => item.id === activeAlbumId);
  const photos = activeAlbum?.photos || [];

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen || photos.length === 0) return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveAlbumId(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i - 1 + photos.length) % photos.length);
    };
    
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isLightboxOpen, photos.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gray-800 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Portfolio
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Showcasing our expertise in livestreaming, event coverage, and professional photography
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="lg"
                className={`px-8 py-3 ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>

          {/* Albums Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-all duration-300 bg-white"
              >
                {/* Image area */}
                <div
                  className="rounded-t-lg overflow-hidden cursor-pointer"
                  onClick={() => {
                    setActiveAlbumId(item.id);
                    setLightboxIndex(0);
                  }}
                >
                  <div className="relative">
                    <AspectRatio ratio={16/9}>
                      {item.coverUrl ? (
                        <img 
                          src={item.coverUrl} 
                          srcSet={`${item.coverUrl} 1000w`} 
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                          alt={item.title} 
                          className="w-full h-full object-cover bg-muted" 
                          loading="lazy" 
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-gray-400 opacity-30">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                        </div>
                      )}
                    </AspectRatio>
                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {item.category}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Show message when no items match filter */}
          {items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No projects found for the selected category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Album Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={(open) => setActiveAlbumId(open ? activeAlbumId : null)}>
        <DialogContent className="max-w-5xl">
          <div className="space-y-3">
            <DialogHeader>
              <DialogTitle>
                {activeAlbum?.title || "Album"}
              </DialogTitle>
              <DialogDescription>
                {activeAlbum?.description || ""}
              </DialogDescription>
            </DialogHeader>

            <div className="w-full max-h-[80vh] flex items-center justify-center bg-black/5 rounded">
              {photos.length === 0 ? (
                <div className="p-16 text-sm text-muted-foreground">No photos in this album yet.</div>
              ) : (
                <img
                  src={photos[lightboxIndex]}
                  srcSet={`${photos[lightboxIndex]} 1600w`}
                  sizes="100vw"
                  alt={activeAlbum?.title || ""}
                  className="max-h-[78vh] w-auto object-contain cursor-pointer"
                  onClick={() => setLightboxIndex((i) => (i + 1) % photos.length)}
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {photos.length > 0 ? `${lightboxIndex + 1} / ${photos.length} — Use ← → or click image to navigate` : ""}
              </div>
              {photos.length > 0 && (
                <a
                  className="text-sm underline"
                  href={photos[lightboxIndex]}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open original
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
