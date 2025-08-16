import React from 'react';

interface HeroVideoProps {
  videoUrl?: string;
  youtubeId?: string;
  vimeoId?: string;
  posterUrl?: string;
  className?: string;
}

export const HeroVideo: React.FC<HeroVideoProps> = ({
  videoUrl,
  youtubeId,
  vimeoId,
  posterUrl,
  className = ''
}) => {
  // If YouTube ID is provided, use YouTube embed
  if (youtubeId) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Hero Video"
        />
      </div>
    );
  }

  // If Vimeo ID is provided, use Vimeo embed
  if (vimeoId) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&controls=0&background=1&autopause=0`}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Hero Video"
        />
      </div>
    );
  }

  // If local video URL is provided, use HTML5 video
  if (videoUrl) {
    return (
      <video
        className={`w-full h-full object-cover ${className}`}
        autoPlay
        muted
        loop
        playsInline
        poster={posterUrl}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  // Fallback to a placeholder
  return (
    <div className={`w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center ${className}`}>
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Ainan Studio</h2>
        <p className="text-lg opacity-80">Professional Photography Services</p>
      </div>
    </div>
  );
};
