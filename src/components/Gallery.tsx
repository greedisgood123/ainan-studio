import galleryImages from '@/assets/imagesCarousel';
// Import carousel components from our UI library for creating an image slider
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Local images are imported above and ready to use!

/**
 * Gallery Component - Displays a carousel of professional headshot portfolio images
 * 
 * Features:
 * - Responsive image carousel with navigation arrows
 * - Hover effects with scaling and overlay
 * - Grid layout that adapts to screen size
 * - Professional styling with shadows and transitions
 */
export const Gallery = () => {
  // galleryImages is already imported at the top of the file
  // Your images are now loaded from src/assets/imagesCarousel/

  return (
    // Main section container with padding and background styling
    <section className="py-20 px-6 bg-background">
      {/* Centered container with max width for better readability */}
      <div className="max-w-7xl mx-auto">
        
        {/* Section header with title and description */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our Work
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional headshots that make lasting impressions
          </p>
        </div>

        {/* 
          Carousel component configuration:
          - align: "start" - items align to the left
          - loop: true - infinite scrolling
        */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {/* 
              Map through each image and create carousel items
              Responsive grid:
              - basis-1/2: 2 columns on mobile
              - md:basis-1/3: 3 columns on medium screens  
              - lg:basis-1/4: 4 columns on large screens
            */}
            {galleryImages.map((image, index) => (
              <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                {/* 
                  Image container with hover effects:
                  - group: enables group-hover effects on child elements
                  - relative: positioning context for absolute overlay
                  - overflow-hidden: ensures image scaling stays within bounds
                  - rounded-lg: rounded corners
                  - shadow effects that change on hover
                */}
                <div className="group relative overflow-hidden rounded-lg shadow-soft hover:shadow-elegant transition-all duration-300">
                  {/* 
                    Main image with hover scaling effect:
                    - h-80: fixed height for consistent grid
                    - object-cover: maintains aspect ratio while filling container
                    - group-hover:scale-105: slight zoom on hover
                  */}
                  <img
                    src={image}
                    alt={`Professional headshot example ${index + 1}`}
                    className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* 
                    Hover overlay effect:
                    - absolute inset-0: covers entire image
                    - gradient from transparent to semi-black
                    - opacity-0 by default, opacity-100 on hover
                    - smooth transition animation
                  */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Navigation arrows positioned on left and right */}
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>
    </section>
  );
};