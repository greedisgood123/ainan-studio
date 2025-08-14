import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground py-12 md:py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Team's Professional Image?
            </h2>
            <p className="text-base sm:text-lg mb-8 text-primary-foreground/80">
              Contact us today to schedule your on-site headshot session and give your team the professional edge they deserve.
            </p>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Book Your Session
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sm md:text-base">Call Us</div>
                <div className="text-primary-foreground/80 text-sm md:text-base">+60 12-345 6789</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sm md:text-base">Email Us</div>
                <div className="text-primary-foreground/80 text-sm md:text-base">hello@headshotpro.my</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sm md:text-base">Service Area</div>
                <div className="text-primary-foreground/80 text-sm md:text-base">Kuala Lumpur & Selangor</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm md:text-base">
            © {new Date().getFullYear()} Ainan Studio. All rights reserved. Professional headshot photography services in Kuala Lumpur.
          </p>
        </div>
      </div>
    </footer>
  );
};