import ProjectsGallery from "./ProjectsGallery";
import CodeSnippet from "./CodeSnippet";
import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { validateProjects, ValidatedProject } from "@/utils/componentDataValidator";

interface Project {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  image?: string | null;
  github_url?: string | null;
  live_url?: string | null;
  technologies?: string[];
  tags?: Array<{ id: number; name: string }>;
}

interface CodeSnippetData {
  language: string;
  code: string;
  description?: string;
  filename?: string;
}

interface ProjectsProps {
  projects?: Project[] | any[];
  codeSnippets?: CodeSnippetData[];
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateProjects({ projects, codeSnippets, templateType, config }: ProjectsProps) {
  const classes = {
    classic: "template-classic-section",
    modern: "template-modern-section",
    minimalist: "template-minimalist-section",
    developer: "template-developer-section",
    designer: "template-designer-section",
  };

  const sectionClass = classes[templateType as keyof typeof classes] || classes.modern;

  // Validate and normalize projects
  const validatedProjects = validateProjects(projects || []);
  const hasProjects = validatedProjects && validatedProjects.length > 0;
  const hasCodeSnippets = codeSnippets && Array.isArray(codeSnippets) && codeSnippets.length > 0;

  if (!hasProjects && !hasCodeSnippets) {
    return (
      <ComponentErrorBoundary componentName="Projects">
        <section id="section-projects" className={sectionClass}>
          <div className="max-w-4xl mx-auto">
            <h2 className="template-section-title">Projects</h2>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No projects to display</p>
              <p className="text-sm text-muted-foreground">
                Add projects to showcase your work and achievements.
              </p>
            </div>
          </div>
        </section>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="Projects">
      <section id="section-projects" className={sectionClass}>
        <div className="max-w-6xl mx-auto">
          <h2 className="template-section-title">Projects</h2>
          
          {hasProjects && (
            <div className="mb-8">
              <ProjectsGallery projects={validatedProjects as ValidatedProject[]} templateType={templateType} />
            </div>
          )}

          {hasCodeSnippets && templateType === "developer" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Code Samples</h3>
              {codeSnippets.map((snippet, idx) => {
                // Ensure snippet has required fields
                if (!snippet || typeof snippet !== 'object') return null;
                
                const validSnippet = {
                  language: snippet.language || "text",
                  code: snippet.code || "",
                  description: snippet.description,
                  filename: snippet.filename,
                };
                
                if (!validSnippet.code) return null;
                
                return <CodeSnippet key={idx} snippet={validSnippet} />;
              })}
            </div>
          )}
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

