import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { validateUrl } from "@/utils/componentDataValidator";
import { useState } from "react";
import ComponentErrorBoundary from "./ComponentErrorBoundary";

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

interface ProjectsGalleryProps {
  projects: Project[];
  templateType?: string;
  className?: string;
}

export default function ProjectsGallery({ projects, templateType = "modern", className = "" }: ProjectsGalleryProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  if (!Array.isArray(projects) || projects.length === 0) {
    return (
      <ComponentErrorBoundary componentName="Projects Gallery">
        <div className="text-center py-8 text-muted-foreground">
          <p>No projects to display</p>
        </div>
      </ComponentErrorBoundary>
    );
  }

  const handleImageError = (projectId: number) => {
    setImageErrors(prev => new Set(prev).add(projectId));
  };

  const getProjectImageUrl = (image: string | null | undefined, projectId: number) => {
    if (!image || imageErrors.has(projectId)) return null;
    return getImageUrl(image);
  };

  const validateProjectUrl = (url: string | null | undefined): string | null => {
    return validateUrl(url);
  };

  return (
    <ComponentErrorBoundary componentName="Projects Gallery">
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {projects.map((project) => {
        // Validate project data
        if (!project || !project.id || !project.title) {
          return null;
        }

        const imageUrl = getProjectImageUrl(project.image, project.id);
        const technologies = Array.isArray(project.technologies) 
          ? project.technologies 
          : Array.isArray(project.tags) 
          ? project.tags.map(t => typeof t === 'string' ? t : t?.name).filter(Boolean)
          : [];
        
        const githubUrl = validateProjectUrl(project.github_url);
        const liveUrl = validateProjectUrl(project.live_url);
        
        const description = project.short_description || project.description || '';
        const displayDescription = description.length > 150 
          ? description.substring(0, 150) + '...' 
          : description;

        return (
          <Card
            key={project.id}
            className={`overflow-hidden transition-all hover:shadow-lg group ${
              templateType === "designer" ? "template-designer-card" : ""
            }`}
          >
            {imageUrl ? (
              <div className="aspect-video overflow-hidden bg-muted relative">
                <img
                  src={imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(project.id)}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">{project.title}</h3>
              {displayDescription && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {displayDescription}
                </p>
              )}
              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {technologies.slice(0, 5).map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                    >
                      {String(tech)}
                    </span>
                  ))}
                  {technologies.length > 5 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                      +{technologies.length - 5} more
                    </span>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                {githubUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-element-id={`project-${project.id}-github`}
                      data-element-type="project-link"
                      onClick={(e) => {
                        if (!githubUrl) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Code
                    </a>
                  </Button>
                ) : null}
                {liveUrl ? (
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-element-id={`project-${project.id}-live`}
                      data-element-type="project-link"
                      onClick={(e) => {
                        if (!liveUrl) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live
                    </a>
                  </Button>
                ) : null}
                {!githubUrl && !liveUrl && (
                  <p className="text-xs text-muted-foreground py-2">
                    No links available
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
      </div>
    </ComponentErrorBoundary>
  );
}

