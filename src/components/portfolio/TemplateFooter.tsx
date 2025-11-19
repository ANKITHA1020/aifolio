import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { Linkedin, Github, Twitter, Facebook, Instagram, Youtube, Globe } from "lucide-react";

interface FooterLink {
  text?: string;
  url?: string;
}

interface FooterColumn {
  title?: string;
  links?: FooterLink[];
}

interface FooterProps {
  copyrightText?: string;
  links?: FooterLink[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  columns?: FooterColumn[];
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateFooter({
  copyrightText,
  links = [],
  socialLinks = {},
  columns = [],
  templateType,
  config,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <ComponentErrorBoundary componentName="Footer">
      <footer id="section-footer" className={`template-footer template-footer-${templateType}`}>
        <div className="template-footer-container">
          {columns.length > 0 && (
            <div className="template-footer-columns">
              {columns.map((column, idx) => (
                <div key={idx} className="template-footer-column">
                  {column.title && (
                    <h3 className="template-footer-column-title">
                      {column.title}
                    </h3>
                  )}
                  {column.links && column.links.length > 0 && (
                    <ul className="template-footer-column-links">
                      {column.links.map((link, linkIdx) => (
                        <li key={linkIdx}>
                          <a
                            href={link.url || "#"}
                            className="template-footer-link"
                          >
                            {link.text || "Link"}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {(links.length > 0 ||
            socialLinks.linkedin ||
            socialLinks.github ||
            socialLinks.twitter ||
            socialLinks.facebook ||
            socialLinks.instagram ||
            socialLinks.youtube ||
            socialLinks.website) && (
            <div className="template-footer-bottom">
              {links.length > 0 && (
                <div className="template-footer-links">
                  {links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url || "#"}
                      className="template-footer-link"
                    >
                      {link.text || "Link"}
                    </a>
                  ))}
                </div>
              )}

              {(socialLinks.linkedin ||
                socialLinks.github ||
                socialLinks.twitter ||
                socialLinks.facebook ||
                socialLinks.instagram ||
                socialLinks.youtube ||
                socialLinks.website) && (
                <div className="template-footer-social">
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="template-footer-social-link"
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
                      className="template-footer-social-link"
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
                      className="template-footer-social-link"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="template-footer-social-link"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="template-footer-social-link"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="template-footer-social-link"
                      aria-label="YouTube"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="template-footer-social-link"
                      aria-label="Website"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {copyrightText && (
            <div className="template-footer-copyright">
              © {currentYear} {copyrightText}
            </div>
          )}
        </div>
      </footer>
    </ComponentErrorBoundary>
  );
}

