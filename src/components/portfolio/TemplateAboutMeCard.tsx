import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { Linkedin, Github, Twitter, Mail, Globe } from "lucide-react";

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
}

export default function TemplateAboutMeCard({
  name,
  title,
  bio,
  image,
  socialLinks = {},
  templateType,
  config,
}: AboutMeCardProps) {
  return (
    <ComponentErrorBoundary componentName="About Me Card">
      <section id="section-about_me_card" className={`about-me-card about-me-card-${templateType}`}>
        <div className="about-me-card-container">
          <div className="about-me-card-content">
            {image && (
              <div className="about-me-card-image-wrapper">
                <img
                  src={image}
                  alt={name || "Profile"}
                  className="about-me-card-image"
                />
              </div>
            )}
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

