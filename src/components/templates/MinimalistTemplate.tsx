import TemplateHeader from "@/components/portfolio/TemplateHeader";
import TemplateHeroBanner from "@/components/portfolio/TemplateHeroBanner";
import TemplateAboutMeCard from "@/components/portfolio/TemplateAboutMeCard";
import TemplateSkillsCloud from "@/components/portfolio/TemplateSkillsCloud";
import TemplateExperienceTimeline from "@/components/portfolio/TemplateExperienceTimeline";
import TemplateProjectGrid from "@/components/portfolio/TemplateProjectGrid";
import TemplateServicesSection from "@/components/portfolio/TemplateServicesSection";
import TemplateAchievementsCounters from "@/components/portfolio/TemplateAchievementsCounters";
import TemplateTestimonialsCarousel from "@/components/portfolio/TemplateTestimonialsCarousel";
import TemplateBlogPreviewGrid from "@/components/portfolio/TemplateBlogPreviewGrid";
import TemplateContactForm from "@/components/portfolio/TemplateContactForm";
import TemplateFooter from "@/components/portfolio/TemplateFooter";
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
  const heroBannerComponent = sortedComponents.find((c) => c.component_type === "hero_banner");
  const aboutMeCardComponent = sortedComponents.find((c) => c.component_type === "about_me_card");
  const skillsCloudComponent = sortedComponents.find((c) => c.component_type === "skills_cloud");
  const experienceTimelineComponent = sortedComponents.find((c) => c.component_type === "experience_timeline");
  const projectGridComponent = sortedComponents.find((c) => c.component_type === "project_grid");
  const servicesSectionComponent = sortedComponents.find((c) => c.component_type === "services_section");
  const achievementsCountersComponent = sortedComponents.find((c) => c.component_type === "achievements_counters");
  const testimonialsCarouselComponent = sortedComponents.find((c) => c.component_type === "testimonials_carousel");
  const blogPreviewGridComponent = sortedComponents.find((c) => c.component_type === "blog_preview_grid");
  const contactFormComponent = sortedComponents.find((c) => c.component_type === "contact_form");
  const footerComponent = sortedComponents.find((c) => c.component_type === "footer");
  const projectGridProjects = Array.isArray(projectGridComponent?.content?.projects)
    ? projectGridComponent.content.projects.filter((project: any) => project && project.image)
    : [];

  // Show profile photo in header only if About Me component doesn't exist
  const hasProfilePhoto = portfolio.profile_photo_url || portfolio.user_profile_photo_url;
  const shouldShowHeader = headerComponent || (hasProfilePhoto && !aboutMeCardComponent);

  return (
    <div ref={containerRef} className="template-minimalist template-container">
      {shouldShowHeader && (
        <TemplateHeader
          title={headerComponent?.content?.title || portfolio.title}
          subtitle={headerComponent?.content?.subtitle}
          templateType="minimalist"
          config={templateConfig}
          profilePhotoUrl={!aboutMeCardComponent ? portfolio.profile_photo_url : undefined}
          userProfilePhotoUrl={!aboutMeCardComponent ? portfolio.user_profile_photo_url : undefined}
        />
      )}

      {heroBannerComponent && (
        <TemplateHeroBanner
          title={heroBannerComponent.content.title || portfolio.title}
          subtitle={heroBannerComponent.content.subtitle}
          backgroundImage={heroBannerComponent.content.background_image}
          backgroundVideo={heroBannerComponent.content.background_video}
          ctaButtons={heroBannerComponent.content.cta_buttons}
          overlayOpacity={heroBannerComponent.content.overlay_opacity}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {aboutMeCardComponent && (
        <TemplateAboutMeCard
          name={aboutMeCardComponent.content.name}
          title={aboutMeCardComponent.content.title}
          bio={aboutMeCardComponent.content.bio}
          image={aboutMeCardComponent.content.image}
          socialLinks={aboutMeCardComponent.content.social_links}
          templateType="minimalist"
          config={templateConfig}
          profilePhotoUrl={portfolio.profile_photo_url}
          userProfilePhotoUrl={portfolio.user_profile_photo_url}
        />
      )}

      {skillsCloudComponent && skillsCloudComponent.content.skills && (
        <TemplateSkillsCloud
          skills={skillsCloudComponent.content.skills}
          displayMode={skillsCloudComponent.content.display_mode}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {experienceTimelineComponent && experienceTimelineComponent.content.experiences && (
        <TemplateExperienceTimeline
          experiences={experienceTimelineComponent.content.experiences}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {projectGridComponent && projectGridComponent.content.projects && (
        <TemplateProjectGrid
          projects={projectGridComponent.content.projects}
          filterCategories={projectGridComponent.content.filter_categories}
          showFilters={projectGridComponent.content.show_filters}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {servicesSectionComponent && servicesSectionComponent.content.services && (
        <TemplateServicesSection
          services={servicesSectionComponent.content.services}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {achievementsCountersComponent && achievementsCountersComponent.content.counters && (
        <TemplateAchievementsCounters
          counters={achievementsCountersComponent.content.counters}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {testimonialsCarouselComponent && testimonialsCarouselComponent.content.testimonials && (
        <TemplateTestimonialsCarousel
          testimonials={testimonialsCarouselComponent.content.testimonials}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {projectGridProjects.length > 0 && (
        <section className="template-minimalist-section">
          <h2 className="template-section-title">Gallery</h2>
          <div className="space-y-6">
            {projectGridProjects
              .map((project: any) => project.image)
              .filter((img: any) => img && typeof img === "string")
              .map((img: string, idx: number) => (
                <img key={idx} src={img} alt="Project" className="w-full rounded-md shadow-sm" />
              ))}
          </div>
        </section>
      )}

      {blogPreviewGridComponent && blogPreviewGridComponent.content.posts && (
        <TemplateBlogPreviewGrid
          posts={blogPreviewGridComponent.content.posts}
          postsPerRow={Math.min(blogPreviewGridComponent.content.posts_per_row || 2, 2)}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {contactFormComponent && (
        <TemplateContactForm
          title={contactFormComponent.content.title}
          description={contactFormComponent.content.description}
          fields={contactFormComponent.content.fields}
          submitButtonText={contactFormComponent.content.submit_button_text}
          contact_info={contactFormComponent.content.contact_info}
          templateType="minimalist"
          config={templateConfig}
        />
      )}

      {footerComponent && (
        <TemplateFooter
          copyrightText={footerComponent.content.copyright_text}
          links={footerComponent.content.links}
          socialLinks={footerComponent.content.social_links}
          columns={footerComponent.content.columns}
          templateType="minimalist"
          config={templateConfig}
        />
      )}
    </div>
  );
}

