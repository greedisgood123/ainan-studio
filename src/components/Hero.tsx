import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AssistantChat } from "./ui/assistant-chat";
import { HeroVideo } from "./HeroVideo";
import heroImage from "@/assets/hero-image.webp";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import React from "react";

export const Hero = () => {
  const navigate = useNavigate();
  const [hero, setHero] = useState<any>(null);

  // Fetch hero settings from local backend
  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const response = await apiClient.get('/api/site-settings');
        const data = await response.json();
        setHero(data);
      } catch (error) {
        console.debug('Failed to fetch hero settings:', error);
        // Continue with fallback values
      }
    };
    fetchHeroSettings();
  }, []);

  // Video configuration - you can change these values
  const videoConfig = {
    // Option 1: Use YouTube (recommended for Cloudflare Pages)
    youtubeId: import.meta.env.VITE_HERO_YOUTUBE_ID || undefined,
    
    // Option 2: Use Vimeo
    vimeoId: import.meta.env.VITE_HERO_VIMEO_ID || undefined,
    
    // Option 3: Use local video (will be optimized for Cloudflare)
    videoUrl: import.meta.env.VITE_HERO_VIDEO_URL || "/hero-cloudflare.mp4",
    
    // Poster image
    posterUrl: hero?.posterUrl || heroImage
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image fallback */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Hero Video Component */}
      <HeroVideo
        className="absolute inset-0"
        youtubeId={videoConfig.youtubeId}
        vimeoId={videoConfig.vimeoId}
        videoUrl={videoConfig.videoUrl}
        posterUrl={videoConfig.posterUrl}
      />

      {/* Enhanced overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
        <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm shadow-lg">
          <MapPin className="w-4 h-4 mr-2" />
          Kuala Lumpur On-Site Service
        </Badge>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl">
          Professional On-Site
          <span className="block text-accent drop-shadow-2xl">Headshot Packages</span>
        </h1>

        <p className="text-base sm:text-xl md:text-2xl mb-8 text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-lg backdrop-blur-sm bg-black/20 px-4 py-2 rounded-lg">
          We bring a studio-quality headshot experience to your office — saving your team hours of travel while ensuring everyone looks their best.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            variant="hero"
            className="shadow-2xl backdrop-blur-sm"
            onClick={() => navigate('/packages')}
          >
            <Camera className="w-5 h-5 mr-2" />
            View Packages
          </Button>
          <Button
            variant="outline"
            className="bg-white/20 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm shadow-lg"
            onClick={() => navigate('/portfolio')}
          >
            <Clock className="w-5 h-5 mr-2" />
            See Our Portfolio
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto">
          <div className="text-center backdrop-blur-sm bg-black/30 px-6 py-4 rounded-lg shadow-lg">
            <div className="text-2xl md:text-3xl font-bold text-accent drop-shadow-lg">48h</div>
            <div className="text-white/90 drop-shadow-md">Rush Delivery</div>
          </div>
          <div className="text-center backdrop-blur-sm bg-black/30 px-6 py-4 rounded-lg shadow-lg">
            <div className="text-2xl md:text-3xl font-bold text-accent drop-shadow-lg">100%</div>
            <div className="text-white/90 drop-shadow-md">On-Site Service</div>
          </div>
        </div>
      </div>

      {/* Floating chat assistant */}
      <AssistantChat />
    </section>
  );
};