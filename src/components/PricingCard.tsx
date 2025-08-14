import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { ButtonBookingForm } from "@/components/ButtonBookingForm";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  addOns?: { name: string; price: string }[];
  isPopular?: boolean;
  badge?: string;
}

export const PricingCard = ({ title, price, description, features, addOns, isPopular, badge }: PricingCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const handleGetStarted = () => {
    setIsModalOpen(true);
  };
  return (
  <Card className={`h-full flex flex-col p-8 relative ${isPopular ? 'border-accent border-2 shadow-elegant' : 'shadow-soft'} hover:shadow-elegant transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-[1.01]`}>
      {badge && (
        <Badge variant="secondary" className="absolute -top-3 left-6 bg-accent text-accent-foreground font-semibold">
          {badge}
        </Badge>
      )}
      {isPopular && (
        <div className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-accent/40 animate-pulse" />
      )}
      
      <div className="space-y-6 flex-1 flex flex-col">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{title}</h3>
          <div className="flex items-baseline mt-2">
            <span className="text-4xl font-bold text-foreground">{price}</span>
          </div>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>

        <div className="flex-1 flex flex-col">
          <ul className="space-y-3">
            {(showAllFeatures ? features : features.slice(0, 6)).map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-foreground leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
          {features.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllFeatures((v) => !v)}
              className="text-sm text-foreground/70 hover:text-foreground mt-3 self-start underline-offset-4 hover:underline"
            >
              {showAllFeatures ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {addOns && addOns.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground mb-3">Add-ons:</h4>
            <ul className="space-y-2">
              {addOns.map((addOn, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{addOn.name}</span>
                  <span className="font-medium text-foreground">{addOn.price}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          variant={isPopular ? "premium" : "outline"} 
          className="w-full mt-auto"
          size="lg"
          onClick={handleGetStarted}
        >
          Get Started
        </Button>
      </div>

      {/* Booking Modal */}
      <ButtonBookingForm
        packageName={title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Card>
  );
};