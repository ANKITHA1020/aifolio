import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { Linkedin, Github, Twitter, Mail, Globe } from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface AboutMeCardProps {
  name?: string;
  title?: string;
  bio?: string;
  image?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    email?: string;
    website?: string;
  };
  templateType: string;
  config?: Record<string, any>;
  profilePhotoUrl?: string | null;
  userProfilePhotoUrl?: string | null;
}

export default function TemplateAboutMeCard({
  name,
  title,
  bio,
  image,
  socialLinks = {},
  templateType,
  config,
  profilePhotoUrl,
  userProfilePhotoUrl,
}: AboutMeCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Prioritize portfolio profile photo, then user profile photo, then component image
  const displayPhotoUrl = profilePhotoUrl || userProfilePhotoUrl || image;
  const photoUrl = displayPhotoUrl ? getImageUrl(displayPhotoUrl) : null;
  const currentPhotoUrl = profilePhotoUrl || userProfilePhotoUrl || image;

  // Reset image error when photo URL changes
  useEffect(() => {
    setImageError(false);
  }, [currentPhotoUrl]);

  // Template-specific photo styling
  const getPhotoClasses = () => {
    const baseClasses = "about-me-card-image";
    const templateClasses = {
      modern: "rounded-2xl border-4 border-purple-200 shadow-xl",
      classic: "rounded-lg border-4 border-blue-200 shadow-lg",
      minimalist: "rounded-full border-2 border-gray-200 shadow-md",
      developer: "rounded-lg border-4 border-green-200 shadow-lg",
      designer: "rounded-2xl border-4 border-orange-200 shadow-xl",
    };
    return cn(baseClasses, templateClasses[templateType as keyof typeof templateClasses] || templateClasses.modern);
  };

  return (
    <ComponentErrorBoundary componentName="About Me Card">
      <section id="section-about_me_card" className={`about-me-card about-me-card-${templateType}`}>
        <div className="about-me-card-container">
          <div className="about-me-card-content">
            {/* Column 1: Profile Photo */}
            {photoUrl && !imageError && (
              <div className="about-me-card-image-wrapper">
                <img
                  src={photoUrl}
                  alt={name || "Profile"}
                  className={getPhotoClasses()}
                  onError={() => setImageError(true)}
                  onLoad={() => {
                    if (import.meta.env.DEV) {
                      console.log('[TemplateAboutMeCard] Profile photo loaded:', photoUrl);
                    }
                  }}
                  loading="lazy"
                />
              </div>
            )}
            {/* Column 2: About Me Content */}
            <div className="about-me-card-text">
              {name && <h2 className="about-me-card-name">{name}</h2>}
              {title && <p className="about-me-card-title">{title}</p>}
              {bio && <p className="about-me-card-bio">{bio}</p>}
              {(socialLinks.linkedin ||
                socialLinks.github ||
                socialLinks.twitter ||
                socialLinks.email ||
                socialLinks.website) && (
                <div className="about-me-card-social">
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-me-card-social-link"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.github && (
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-me-card-social-link"
                      aria-label="GitHub"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-me-card-social-link"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.email && (
                    <a
                      href={`mailto:${socialLinks.email}`}
                      className="about-me-card-social-link"
                      aria-label="Email"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-me-card-social-link"
                      aria-label="Website"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

