import { useEffect, useRef } from "react";
import ComponentErrorBoundary from "./ComponentErrorBoundary";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  ctaButtons?: Array<{ text: string; url: string; variant: string }>;
  overlayOpacity?: number;
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateHeroBanner({
  title,
  subtitle,
  backgroundImage,
  backgroundVideo,
  ctaButtons = [],
  overlayOpacity = 0.5,
  templateType,
  config,
}: HeroBannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && backgroundVideo) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, user interaction required
      });
    }
  }, [backgroundVideo]);

  const hasBackground = backgroundImage || backgroundVideo;

  return (
    <ComponentErrorBoundary componentName="Hero Banner">
      <section id="section-hero_banner" className={`hero-banner hero-banner-${templateType}`}>
        <div className="hero-banner-background">
          {backgroundVideo ? (
            <video
              ref={videoRef}
              className="hero-banner-video"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src={backgroundVideo} type="video/mp4" />
            </video>
          ) : backgroundImage ? (
            <div
              className="hero-banner-image"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
          ) : null}
          {hasBackground && (
            <div
              className="hero-banner-overlay"
              style={{ opacity: overlayOpacity }}
            />
          )}
        </div>
        <div className="hero-banner-content">
          <div className="hero-banner-container">
            {title && <h1 className="hero-banner-title">{title}</h1>}
            {subtitle && <p className="hero-banner-subtitle">{subtitle}</p>}
            {ctaButtons && ctaButtons.length > 0 && (
              <div className="hero-banner-cta">
                {ctaButtons.map((button, idx) => (
                  <a
                    key={idx}
                    href={button.url}
                    className={`hero-banner-button hero-banner-button-${button.variant || "primary"}`}
                  >
                    {button.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}
