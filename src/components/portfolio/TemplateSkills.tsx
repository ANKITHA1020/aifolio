import { normalizeSkills } from "@/utils/componentDataValidator";
import ComponentErrorBoundary from "./ComponentErrorBoundary";

interface SkillsProps {
  skills: string[] | any;
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateSkills({ skills, templateType, config }: SkillsProps) {
  // Normalize skills from various formats
  const normalizedSkills = normalizeSkills(skills);
  
  if (!normalizedSkills || normalizedSkills.length === 0) {
    return (
      <section id="section-skills" className={`template-${templateType}-section`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="template-section-title">Skills</h2>
          <p className="text-muted-foreground text-center py-8">
            No skills to display. Add your skills to showcase your expertise.
          </p>
        </div>
      </section>
    );
  }

  const classes = {
    classic: "template-classic-section",
    modern: "template-modern-section",
    minimalist: "template-minimalist-section",
    developer: "template-developer-section",
    designer: "template-designer-section",
  };

  const sectionClass = classes[templateType as keyof typeof classes] || classes.modern;

  const getSkillStyle = (type: string) => {
    switch (type) {
      case "classic":
        return "px-4 py-2 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors";
      case "modern":
        return "px-4 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors";
      case "minimalist":
        return "px-3 py-1 border-b border-gray-300 text-gray-700 hover:border-gray-500 transition-colors";
      case "developer":
        return "px-3 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20 font-mono text-sm hover:bg-green-500/20 transition-colors";
      case "designer":
        return "px-4 py-2 bg-orange-100 text-orange-700 rounded-full border border-orange-200 hover:bg-orange-200 transition-colors";
      default:
        return "px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors";
    }
  };

  return (
    <ComponentErrorBoundary componentName="Skills">
      <section id="section-skills" className={sectionClass}>
        <div className="max-w-4xl mx-auto">
          <h2 className="template-section-title">Skills</h2>
          <div className="flex flex-wrap gap-3">
            {normalizedSkills.map((skill, idx) => (
              <span
                key={idx}
                className={getSkillStyle(templateType)}
                title={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

