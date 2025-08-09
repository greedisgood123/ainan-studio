import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";


export const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Weddings", "Corporate", "Livefeed"];
  const data = useQuery(api.portfolio.listPublic, { category: activeFilter === "All" ? undefined : activeFilter });
  const items = useMemo(() => (data ?? []).map((i: any) => ({
    id: i._id,
    title: i.title,
    description: i.description,
    category: i.category,
    imageUrl: i.imageUrl as string | undefined,
  })), [data]);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const isLightboxOpen = lightboxIdx !== null;

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx(idx => (idx === null ? null : (idx + 1) % items.length));
      if (e.key === "ArrowLeft") setLightboxIdx(idx => (idx === null ? null : (idx - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isLightboxOpen, items.length]);

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

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-all duration-300 bg-white"
              >
                {/* Image area */}
                <div className="rounded-t-lg overflow-hidden cursor-pointer" onClick={() => setLightboxIdx(items.findIndex(x => x.id === item.id))}>
                  <div className="relative">
                    <AspectRatio ratio={16/9}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain bg-muted" />
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

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={(open) => setLightboxIdx(open ? (lightboxIdx ?? 0) : null)}>
        <DialogContent className="max-w-5xl">
          {isLightboxOpen && items[lightboxIdx!] && (
            <div className="space-y-3">
              <DialogHeader>
                <DialogTitle>{items[lightboxIdx!].title}</DialogTitle>
                <DialogDescription>{items[lightboxIdx!].description}</DialogDescription>
              </DialogHeader>
              <div className="w-full max-h-[80vh] flex items-center justify-center bg-black/5 rounded">
                {items[lightboxIdx!].imageUrl ? (
                  <img
                    src={items[lightboxIdx!].imageUrl}
                    alt={items[lightboxIdx!].title}
                    className="max-h-[78vh] w-auto object-contain"
                    onClick={() => setLightboxIdx((lightboxIdx! + 1) % items.length)}
                  />
                ) : (
                  <div className="p-16 text-sm text-muted-foreground">No image available</div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Use ← → or click image to navigate</div>
                {items[lightboxIdx!].imageUrl && (
                  <a
                    className="text-sm underline"
                    href={items[lightboxIdx!].imageUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open original
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
