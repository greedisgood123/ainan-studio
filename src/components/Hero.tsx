import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Clock } from "lucide-react";
import heroImage from "@/assets/hero-headshot.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-hero-gradient"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
        <Badge variant="secondary" className="mb-6 bg-accent/20 text-accent border-accent/30">
          <MapPin className="w-4 h-4 mr-2" />
          Kuala Lumpur On-Site Service
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Professional On-Site
          <span className="block text-accent">Headshot Packages</span>
        </h1>

        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
          We bring a studio-quality headshot experience to your office — saving your team hours of travel while ensuring everyone looks their best.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button variant="hero">
            <Camera className="w-5 h-5 mr-2" />
            View Packages
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            <Clock className="w-5 h-5 mr-2" />
            Book Consultation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">48h</div>
            <div className="text-white/80">Rush Delivery</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">100%</div>
            <div className="text-white/80">On-Site Service</div>
          </div>
        </div>
      </div>
    </section>
  );
};