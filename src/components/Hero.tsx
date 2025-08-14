import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AssistantChat } from "./ui/assistant-chat";
import heroImage from "@/assets/hero-image.webp";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import React from "react";

export const Hero = () => {
  const navigate = useNavigate();
  const hero = useQuery(api.siteSettings.getHero, {});
  const [videoReady, setVideoReady] = React.useState(false);
  const [videoError, setVideoError] = React.useState<string | null>(null);
  const [canAttemptVideo, setCanAttemptVideo] = React.useState<boolean>(false);

  // Optional: allow hardcoded public URLs via env to skip upload/storage entirely
  const overrideMp4 = (import.meta.env.VITE_HERO_MP4_URL as string | undefined) || undefined;
  const overrideWebm = (import.meta.env.VITE_HERO_WEBM_URL as string | undefined) || undefined;
  const overridePoster = (import.meta.env.VITE_HERO_POSTER_URL as string | undefined) || undefined;
  // Prefer Convex-provided URLs first; fall back to env overrides
  const videoMp4 = (hero?.mp4Url as string | undefined) || overrideMp4;
  const videoWebm = (hero?.webmUrl as string | undefined) || overrideWebm;
  // Use bundled hero image as final fallback to avoid 404s in production
  const videoPoster = (hero?.posterUrl as string | undefined) || overridePoster || (heroImage as string);

  // If we have video URLs attempt playback; if it never becomes ready, fall back after a short timeout
  React.useEffect(() => {
    if (!videoMp4 && !videoWebm) return;
    setCanAttemptVideo(true); // try to play even if cross-origin HEAD would have failed
    if (videoReady) return;
    const t = setTimeout(() => {
      if (!videoReady) setVideoError((prev) => prev ?? "timeout");
    }, 4000);
    return () => clearTimeout(t);
  }, [videoMp4, videoWebm, videoReady]);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Always render an image fallback. Overlay the video only when ready. */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {(videoMp4 || videoWebm) && !videoError && canAttemptVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={videoPoster}
          crossOrigin="anonymous"
          onCanPlay={() => setVideoReady(true)}
          onLoadedMetadata={() => setVideoReady(true)}
          onLoadedData={() => setVideoReady(true)}
          onError={(e) => {
            console.error("Hero video failed to load", e);
            setVideoError("load-error");
          }}
          style={{ opacity: videoReady ? 1 : 0 }}
        >
          {videoWebm && <source src={videoWebm} type="video/webm" />}
          {videoMp4 && <source src={videoMp4} type="video/mp4" />}
          Your browser does not support the video tag.
        </video>
      )}

      {/* Enhanced overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
        <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm shadow-lg">
          <MapPin className="w-4 h-4 mr-2" />
          Kuala Lumpur On-Site Service
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl">
          Professional On-Site
          <span className="block text-accent drop-shadow-2xl">Headshot Packages</span>
        </h1>

        <p className="text-xl md:text-2xl mb-8 text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-lg backdrop-blur-sm bg-black/20 px-4 py-2 rounded-lg">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="text-center backdrop-blur-sm bg-black/30 px-6 py-4 rounded-lg shadow-lg">
            <div className="text-3xl font-bold text-accent drop-shadow-lg">48h</div>
            <div className="text-white/90 drop-shadow-md">Rush Delivery</div>
          </div>
          <div className="text-center backdrop-blur-sm bg-black/30 px-6 py-4 rounded-lg shadow-lg">
            <div className="text-3xl font-bold text-accent drop-shadow-lg">100%</div>
            <div className="text-white/90 drop-shadow-md">On-Site Service</div>
          </div>
        </div>
      </div>

      {/* Floating chat assistant */}
      <AssistantChat />
    </section>
  );
};