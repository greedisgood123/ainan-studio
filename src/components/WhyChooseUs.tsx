import { Card } from "@/components/ui/card";
import { Clock, Users, Zap, Award } from "lucide-react";

export const WhyChooseUs = () => {
  const benefits = [
    {
      icon: Clock,
      title: "No Commute, No Downtime",
      description: "Your office becomes the studio — save hours of travel time for your entire team."
    },
    {
      icon: Users,
      title: "Consistent Brand Image",
      description: "Professional, cohesive headshots across your entire team for a unified company presence."
    },
    {
      icon: Zap,
      title: "Fast, Easy, Polished",
      description: "Just show up, and we'll handle the rest. Efficient process with stunning results."
    },
    {
      icon: Award,
      title: "Studio-Quality Results",
      description: "Professional lighting and equipment ensure everyone looks their absolute best."
    }
  ];

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Clients Love This Package
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your team's professional image with our convenient on-site service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="p-6 text-center shadow-soft hover:shadow-elegant transition-all duration-300">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};