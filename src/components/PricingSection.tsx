import { PricingCard } from "@/components/PricingCard";

export const PricingSection = () => {
  const packages = [
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
      title: "Team Session",
      price: "RM 500/hour",
      description: "Ideal for small to mid-sized teams (4–10 pax).",
      features: [
        "Portable studio setup at your office",
        "~6 minutes per person",
        "1 final retouched image per person",
        "Team gallery delivered in 5–7 working days",
        "Client selects preferred image from previews",
        "Max 10 pax per hour"
      ],
      addOns: [
        { name: "Multiple looks/team photos", price: "Extra hour booking" }
      ],
      isPopular: true,
      badge: "Most Popular"
    },
    {
      title: "Large Team Session",
      price: "RM 1,500",
      description: "Corporate headshots for up to 30 team members.",
      features: [
        "Up to 30 team members",
        "1 retouched image per person",
        "Full on-site setup",
        "3-hour shoot with efficient flow",
        "Group gallery + delivery in 7 working days",
        "Consistent brand image across your team"
      ],
      addOns: [
        { name: "Additional person (beyond 30)", price: "RM 50/pax" },
        { name: "Extra hour", price: "RM 300/hour" }
      ]
    }
  ];

  return (
    <section id="packages" className="py-20 px-6 bg-secondary/30">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <PricingCard key={index} {...pkg} />
          ))}
        </div>
      </div>
    </section>
  );
};