import TemplateHeader from "@/components/portfolio/TemplateHeader";
import TemplateAbout from "@/components/portfolio/TemplateAbout";
import TemplateSkills from "@/components/portfolio/TemplateSkills";
import TemplateProjects from "@/components/portfolio/TemplateProjects";
import TemplateBlog from "@/components/portfolio/TemplateBlog";
import TemplateContact from "@/components/portfolio/TemplateContact";
import CodeSnippet from "@/components/portfolio/CodeSnippet";
import { getTemplateColors } from "@/utils/templateStyles";
import { useEffect, useRef } from "react";

interface Component {
  component_type: string;
  content: Record<string, any>;
}

interface DeveloperTemplateProps {
  portfolio: {
    title: string;
    template_type: string;
    custom_settings?: Record<string, any>;
    components: Component[];
    profile_photo_url?: string | null;
    user_profile_photo_url?: string | null;
  };
  templateConfig?: Record<string, any>;
}

export default function DeveloperTemplate({ portfolio, templateConfig }: DeveloperTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colors = getTemplateColors("developer", templateConfig);

  useEffect(() => {
    if (containerRef.current && templateConfig) {
      containerRef.current.style.setProperty("--template-primary", colors.primary);
      containerRef.current.style.setProperty("--template-secondary", colors.secondary);
    }
  }, [templateConfig, colors]);

  const sortedComponents = [...(portfolio.components || [])]
    .filter((c) => c.is_visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const headerComponent = sortedComponents.find((c) => c.component_type === "header");
  const aboutComponent = sortedComponents.find((c) => c.component_type === "about");
  const skillsComponent = sortedComponents.find((c) => c.component_type === "skills");
  const projectsComponent = sortedComponents.find((c) => c.component_type === "projects");
  const blogComponent = sortedComponents.find((c) => c.component_type === "blog");
  const contactComponent = sortedComponents.find((c) => c.component_type === "contact");

  const codeSnippets = Array.isArray(projectsComponent?.content.code_snippets) 
    ? projectsComponent.content.code_snippets 
    : [];

  return (
    <div ref={containerRef} className="template-developer template-container">
      {headerComponent && (
        <TemplateHeader
          title={headerComponent.content.title || portfolio.title}
          subtitle={headerComponent.content.subtitle}
          templateType="developer"
          config={templateConfig}
          profilePhotoUrl={portfolio.profile_photo_url}
          userProfilePhotoUrl={portfolio.user_profile_photo_url}
        />
      )}

      {aboutComponent && aboutComponent.content.bio && (
        <TemplateAbout
          bio={aboutComponent.content.bio}
          templateType="developer"
          config={templateConfig}
        />
      )}

      {skillsComponent && skillsComponent.content.skills && (
        <TemplateSkills
          skills={skillsComponent.content.skills}
          templateType="developer"
          config={templateConfig}
        />
      )}

      {projectsComponent && (
        <TemplateProjects
          projects={projectsComponent.content.projects}
          codeSnippets={codeSnippets}
          templateType="developer"
          config={templateConfig}
        />
      )}

      {codeSnippets.length > 0 && (
        <section className="template-developer-section">
          <div className="max-w-6xl mx-auto">
            <h2 className="template-section-title">Code Samples</h2>
            <div className="space-y-4">
              {codeSnippets.map((snippet: any, idx: number) => {
                // Ensure snippet has required fields
                const validSnippet = {
                  language: snippet.language || "text",
                  code: snippet.code || "",
                  description: snippet.description,
                  filename: snippet.filename,
                };
                return <CodeSnippet key={idx} snippet={validSnippet} />;
              })}
            </div>
          </div>
        </section>
      )}

      {blogComponent && (
        <TemplateBlog
          posts={blogComponent.content.posts}
          templateType="developer"
          config={templateConfig}
        />
      )}

      {contactComponent && (
        <TemplateContact
          email={contactComponent.content.email}
          phone={contactComponent.content.phone}
          location={contactComponent.content.location}
          linkedin={contactComponent.content.linkedin || contactComponent.content.social?.linkedin}
          github={contactComponent.content.github || contactComponent.content.social?.github}
          website={contactComponent.content.website || contactComponent.content.social?.website}
          templateType="developer"
          config={templateConfig}
        />
      )}
    </div>
  );
}

