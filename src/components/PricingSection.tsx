import { PricingCard } from "@/components/PricingCard";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const PricingSection = () => {
  const data = useQuery(api.packages.listPublic, {});
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
  ];
  const packages = (data && data.length > 0 ? data : fallback) as any[];

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