import ComponentErrorBoundary from "./ComponentErrorBoundary";

interface Service {
  title?: string;
  description?: string;
  icon?: string;
}

interface ServicesSectionProps {
  services: Service[];
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateServicesSection({
  services = [],
  templateType,
  config,
}: ServicesSectionProps) {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <ComponentErrorBoundary componentName="Services Section">
      <section id="section-services_section" className={`services-section services-section-${templateType}`}>
        <div className="services-section-container">
          <h2 className="services-section-title">Services</h2>
          <div className="services-section-grid">
            {services.map((service, idx) => (
              <div key={idx} className="services-section-item">
                {service.icon && (
                  <div className="services-section-icon">
                    <span dangerouslySetInnerHTML={{ __html: service.icon }} />
                  </div>
                )}
                <h3 className="services-section-item-title">
                  {service.title || "Service"}
                </h3>
                {service.description && (
                  <p className="services-section-item-description">
                    {service.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

