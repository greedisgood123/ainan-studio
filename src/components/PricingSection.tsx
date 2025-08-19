import { PricingCard } from "@/components/PricingCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const PricingSection = () => {
  // Static packages data - no backend needed
  const staticPackagesData = [
    {
      title: "Solo Headshot Session",
      price: "RM 250",
      description: "For individuals who want to stand out professionally. (1 pax)",
      features: [
        "15 min session at your location",
        "4-5 final retouched images (client selects from gallery)",
        "1 outfit, 1 background setup",
        "Online gallery for 2 weeks",
        "3-5 working day delivery"
      ],
      addOns: [
        { name: "Transparent background", price: "RM 20/image" },
        { name: "Rush delivery (48 hours)", price: "RM 150" }
      ]
    },
    {
      title: "Team Session",
      price: "RM 500",
      description: "Ideal for small to mid-sized teams. (4-10 pax)",
      features: [
        "1 hour min session at your location",
        "Portable studio setup at your location",
        "4 final retouched image/person",
        "Group photos included",
        "Online gallery for 2 weeks",
        "1 week delivery"
      ],
      addOns: [
        { name: "Additional member", price: "RM 50/person" },
        { name: "Rush delivery (48 hours)", price: "RM 150" }
      ],
    },
    {
      title: "Large Team Session",
      price: "RM 1,500",
      description: "Corporate headshots for up to 30 members (10-30 pax)",
      features: [
        "3 hour max session at your location",
        "Portable studio setup at your location",
        "5 final retouched image/person",
        "Group photos Included",
        "Online gallery for 2 weeks",
        "1-2 week delivery"
      ],
      addOns: [
        { name: "Additional member", price: "RM 40/person" },
        { name: "Rush delivery (48 hours)", price: "RM 150" }
      ],
    },
  ];

  return (
    <section id="packages" className="py-20 px-6 bg-secondary/30 bg-[radial-gradient(1000px_circle_at_50%_-20%,hsl(var(--accent)/0.15),transparent_60%)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your Package
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Perfect for LinkedIn profiles, team pages, keynote decks, and more. 
            No commute, no downtime — your office becomes the studio.
          </p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 4500 }) as unknown as any]}
        >
          <CarouselContent className="items-stretch">
            {staticPackagesData.map((pkg, index) => (
              <CarouselItem
                key={index}
                className="basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <div
                  className="h-full animate-in fade-in-50 slide-in-from-bottom-4 [animation-fill-mode:backwards]"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <PricingCard {...pkg} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Add-On Section */}
        <div className="mt-16 flex justify-center">
          <div className="bg-white rounded-lg shadow-soft p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-center mb-6">Add-On</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-foreground">Extra Retouched Image</span>
                <span className="font-medium text-foreground">20/image</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Transparent White Background</span>
                <span className="font-medium text-foreground">20/image</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Rush Delivery</span>
                <span className="font-medium text-foreground">150</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Group Photo (if not included)</span>
                <span className="font-medium text-foreground">100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Makeup Artist</span>
                <span className="font-medium text-foreground">Upon Request</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};