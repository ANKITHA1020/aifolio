import { useState } from "react";
import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { Send, Loader2, Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

interface ContactFormProps {
  title?: string;
  description?: string;
  fields?: string[];
  submitButtonText?: string;
  contact_info?: ContactInfo;
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateContactForm({
  title = "Contact Info",
  description,
  fields = ["name", "email", "message"],
  submitButtonText = "Send Message",
  contact_info,
  templateType,
  config,
}: ContactFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({});
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasContactInfo = contact_info && (
    contact_info.email || 
    contact_info.phone || 
    contact_info.location || 
    contact_info.linkedin || 
    contact_info.github || 
    contact_info.website
  );

  return (
    <ComponentErrorBoundary componentName="Contact Form">
      <section id="section-contact_form" className={`contact-form contact-form-${templateType}`}>
        <div className="contact-form-container">
          {title && <h2 className="contact-form-title">{title}</h2>}
          {description && (
            <p className="contact-form-description">{description}</p>
          )}
          
          {hasContactInfo && (
            <div className="contact-form-info">
              <div className="contact-form-info-grid">
                {contact_info.email && (
                  <div className="contact-form-info-item">
                    <Mail className="contact-form-info-icon" />
                    <a href={`mailto:${contact_info.email}`} className="contact-form-info-link">
                      {contact_info.email}
                    </a>
                  </div>
                )}
                {contact_info.phone && (
                  <div className="contact-form-info-item">
                    <Phone className="contact-form-info-icon" />
                    <a href={`tel:${contact_info.phone}`} className="contact-form-info-link">
                      {contact_info.phone}
                    </a>
                  </div>
                )}
                {contact_info.location && (
                  <div className="contact-form-info-item">
                    <MapPin className="contact-form-info-icon" />
                    <span className="contact-form-info-text">{contact_info.location}</span>
                  </div>
                )}
                {contact_info.linkedin && (
                  <div className="contact-form-info-item">
                    <Linkedin className="contact-form-info-icon" />
                    <a 
                      href={contact_info.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contact-form-info-link"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {contact_info.github && (
                  <div className="contact-form-info-item">
                    <Github className="contact-form-info-icon" />
                    <a 
                      href={contact_info.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contact-form-info-link"
                    >
                      GitHub Profile
                    </a>
                  </div>
                )}
                {contact_info.website && (
                  <div className="contact-form-info-item">
                    <Globe className="contact-form-info-icon" />
                    <a 
                      href={contact_info.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contact-form-info-link"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="contact-form-form">
            {fields.includes("name") && (
              <div className="contact-form-field">
                <label htmlFor="name" className="contact-form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="contact-form-input"
                  required
                />
              </div>
            )}
            {fields.includes("email") && (
              <div className="contact-form-field">
                <label htmlFor="email" className="contact-form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="contact-form-input"
                  required
                />
              </div>
            )}
            {fields.includes("phone") && (
              <div className="contact-form-field">
                <label htmlFor="phone" className="contact-form-label">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="contact-form-input"
                />
              </div>
            )}
            {fields.includes("subject") && (
              <div className="contact-form-field">
                <label htmlFor="subject" className="contact-form-label">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject || ""}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className="contact-form-input"
                />
              </div>
            )}
            {fields.includes("message") && (
              <div className="contact-form-field">
                <label htmlFor="message" className="contact-form-label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message || ""}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className="contact-form-textarea"
                  rows={5}
                  required
                />
              </div>
            )}
            <button
              type="submit"
              className="contact-form-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {submitButtonText}
                </>
              )}
            </button>
            {submitStatus === "success" && (
              <div className="contact-form-success">
                Thank you! Your message has been sent.
              </div>
            )}
            {submitStatus === "error" && (
              <div className="contact-form-error">
                Something went wrong. Please try again.
              </div>
            )}
          </form>
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

