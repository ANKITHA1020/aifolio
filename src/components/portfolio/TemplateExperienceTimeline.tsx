import ComponentErrorBoundary from "./ComponentErrorBoundary";

interface Experience {
  title?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  location?: string;
}

interface ExperienceTimelineProps {
  experiences: Experience[];
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateExperienceTimeline({
  experiences = [],
  templateType,
  config,
}: ExperienceTimelineProps) {
  if (!experiences || experiences.length === 0) {
    return null;
  }

  return (
    <ComponentErrorBoundary componentName="Experience Timeline">
      <section id="section-experience_timeline" className={`experience-timeline experience-timeline-${templateType}`}>
        <div className="experience-timeline-container">
          <h2 className="experience-timeline-title">Experience</h2>
          <div className="experience-timeline-list">
            {experiences.map((exp, idx) => (
              <div key={idx} className="experience-timeline-item">
                <div className="experience-timeline-dot" />
                <div className="experience-timeline-content">
                  <div className="experience-timeline-header">
                    <h3 className="experience-timeline-job-title">
                      {exp.title || "Position"}
                    </h3>
                    {exp.company && (
                      <span className="experience-timeline-company">
                        {exp.company}
                      </span>
                    )}
                  </div>
                  {(exp.startDate || exp.endDate) && (
                    <div className="experience-timeline-dates">
                      {exp.startDate && <span>{exp.startDate}</span>}
                      {exp.startDate && exp.endDate && <span> - </span>}
                      {exp.endDate && <span>{exp.endDate}</span>}
                    </div>
                  )}
                  {exp.location && (
                    <div className="experience-timeline-location">{exp.location}</div>
                  )}
                  {exp.description && (
                    <p className="experience-timeline-description">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

