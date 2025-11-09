import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";
import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { validateUrl, validateEmail } from "@/utils/componentDataValidator";

interface ContactProps {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateContact({
  email,
  phone,
  location,
  linkedin,
  github,
  website,
  templateType,
  config,
}: ContactProps) {
  const classes = {
    classic: "template-classic-section",
    modern: "template-modern-section",
    minimalist: "template-minimalist-section",
    developer: "template-developer-section",
    designer: "template-designer-section",
  };

  const sectionClass = classes[templateType as keyof typeof classes] || classes.modern;

  // Validate and format URLs and email
  const validatedEmail = validateEmail(email);
  const validatedLinkedin = validateUrl(linkedin);
  const validatedGithub = validateUrl(github);
  const validatedWebsite = validateUrl(website);
  const validatedPhone = phone && typeof phone === 'string' ? phone.trim() : null;
  const validatedLocation = location && typeof location === 'string' ? location.trim() : null;

  const hasContactInfo = 
    validatedEmail || 
    validatedPhone || 
    validatedLocation || 
    validatedLinkedin || 
    validatedGithub || 
    validatedWebsite;

  if (!hasContactInfo) {
    return (
      <ComponentErrorBoundary componentName="Contact">
        <section id="section-contact" className={sectionClass}>
          <div className="max-w-4xl mx-auto">
            <h2 className="template-section-title">Contact</h2>
            <p className="text-muted-foreground text-center py-8">
              No contact information available
            </p>
          </div>
        </section>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="Contact">
      <section id="section-contact" className={sectionClass}>
        <div className="max-w-4xl mx-auto">
          <h2 className="template-section-title">Contact</h2>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
              templateType === "minimalist" ? "space-y-2" : ""
            }`}
          >
            {validatedEmail && (
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href={`mailto:${validatedEmail}`}
                  className="template-link hover:underline"
                  data-element-id="contact-email"
                  data-element-type="contact-link"
                >
                  {validatedEmail}
                </a>
              </div>
            )}
            {validatedPhone && (
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href={`tel:${validatedPhone}`}
                  className="template-link hover:underline"
                  data-element-id="contact-phone"
                  data-element-type="contact-link"
                >
                  {validatedPhone}
                </a>
              </div>
            )}
            {validatedLocation && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{validatedLocation}</span>
              </div>
            )}
            {validatedLinkedin && (
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Linkedin className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href={validatedLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="template-link hover:underline"
                  data-element-id="contact-linkedin"
                  data-element-type="social-link"
                >
                  LinkedIn
                </a>
              </div>
            )}
            {validatedGithub && (
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Github className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href={validatedGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="template-link hover:underline"
                  data-element-id="contact-github"
                  data-element-type="social-link"
                >
                  GitHub
                </a>
              </div>
            )}
            {validatedWebsite && (
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href={validatedWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="template-link hover:underline"
                  data-element-id="contact-website"
                  data-element-type="social-link"
                >
                  Website
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

