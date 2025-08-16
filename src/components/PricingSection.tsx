import { PricingCard } from "@/components/PricingCard";
import { apiHelpers } from "@/lib/api";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const PricingSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const packages = await apiHelpers.handleResponse(
          await fetch('http://localhost:3001/api/packages/public')
        );
        setData(packages);
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);
  const fallback = [
    {
      title: "Solo Headshot Session",
      price: "RM 350",
      description: "For individuals who want to stand out professionally.",
      features: [
        "15 min session at your location",
        "4-5 final retouched images (client selects from gallery)",
        "1 outfit, 1 background setup",
        "Web + print resolution delivery",
        "3–5 working day turnaround"
      ],
      addOns: [
        { name: "Transparent background", price: "RM 30/image" },
        { name: "Rush delivery (48 hours)", price: "RM 150" }
      ]
    },
    {
      title: "Team Headshot Session",
      price: "RM 1,200",
      description: "Perfect for small teams needing consistent, professional looks.",
      features: [
        "Up to 8 team members",
        "30–45 min total on-site",
        "1 background setup",
        "Web + print resolution delivery",
        "3–5 working day turnaround",
      ],
      addOns: [
        { name: "Additional member", price: "RM 120/person" },
        { name: "On-site makeup artist", price: "RM 350" },
      ],
      isPopular: true,
      badge: "Most Popular",
    },
    {
      title: "Executive Branding",
      price: "RM 2,400",
      description: "Premium session for C-level and founders to elevate personal brand.",
      features: [
        "Up to 2 hours on-site",
        "Multiple outfit and background changes",
        "10–12 final retouched images",
        "Creative direction and posing guidance",
        "48–72 hour priority delivery",
      ],
      addOns: [
        { name: "Location scouting", price: "RM 300" },
        { name: "Additional retouched image", price: "RM 40/image" },
      ],
    },
  ];
  const packages = (data && data.length > 0 ? data : fallback) as any[];

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
            {packages.map((pkg, index) => (
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
      </div>
    </section>
  );
};