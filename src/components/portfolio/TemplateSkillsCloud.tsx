import ComponentErrorBoundary from "./ComponentErrorBoundary";

interface SkillsCloudProps {
  skills: string[];
  displayMode?: "cloud" | "bars";
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateSkillsCloud({
  skills = [],
  displayMode = "cloud",
  templateType,
  config,
}: SkillsCloudProps) {
  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <ComponentErrorBoundary componentName="Skills Cloud">
      <section id="section-skills_cloud" className={`skills-display skills-display-${templateType}`}>
        <div className="skills-display-container">
          {displayMode === "cloud" ? (
            <div className="skills-cloud">
              {skills.map((skill, idx) => {
                const size = Math.floor(Math.random() * 3) + 1; // Random size 1-3
                return (
                  <span
                    key={idx}
                    className={`skills-cloud-tag skills-cloud-tag-${size}`}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="skills-bars">
              {skills.map((skill, idx) => {
                const level = Math.floor(Math.random() * 40) + 60; // Random 60-100%
                return (
                  <div key={idx} className="skills-bar-item">
                    <div className="skills-bar-header">
                      <span className="skills-bar-label">{skill}</span>
                      <span className="skills-bar-percentage">{level}%</span>
                    </div>
                    <div className="skills-bar-track">
                      <div
                        className="skills-bar-fill"
                        style={{ width: `${level}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

