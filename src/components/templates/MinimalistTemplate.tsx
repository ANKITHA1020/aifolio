import TemplateHeader from "@/components/portfolio/TemplateHeader";
import TemplateAbout from "@/components/portfolio/TemplateAbout";
import TemplateSkills from "@/components/portfolio/TemplateSkills";
import TemplateProjects from "@/components/portfolio/TemplateProjects";
import TemplateBlog from "@/components/portfolio/TemplateBlog";
import TemplateContact from "@/components/portfolio/TemplateContact";
import { getTemplateColors } from "@/utils/templateStyles";
import { useEffect, useRef } from "react";

interface Component {
  component_type: string;
  content: Record<string, any>;
}

interface MinimalistTemplateProps {
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

export default function MinimalistTemplate({ portfolio, templateConfig }: MinimalistTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colors = getTemplateColors("minimalist", templateConfig);

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

  return (
    <div ref={containerRef} className="template-minimalist template-container">
      {headerComponent && (
        <TemplateHeader
          title={headerComponent.content.title || portfolio.title}
          subtitle={headerComponent.content.subtitle}
          templateType="minimalist"
          config={templateConfig}
          profilePhotoUrl={portfolio.profile_photo_url}
          userProfilePhotoUrl={portfolio.user_profile_photo_url}
        />
      )}

      {aboutComponent && aboutComponent.content.bio && (
        <TemplateAbout
          bio={aboutComponent.content.bio}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {skillsComponent && skillsComponent.content.skills && (
        <TemplateSkills
          skills={skillsComponent.content.skills}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {projectsComponent && (
        <TemplateProjects
          projects={projectsComponent.content.projects}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {blogComponent && (
        <TemplateBlog
          posts={blogComponent.content.posts}
          templateType="minimalist"
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
          templateType="minimalist"
          config={templateConfig}
        />
      )}
    </div>
  );
}

