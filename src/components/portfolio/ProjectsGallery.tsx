import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Image as ImageIcon, Eye, Smartphone, Tablet, Monitor, Share2, Copy, Facebook, Twitter, Linkedin } from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { validateUrl } from "@/utils/componentDataValidator";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
        {projects.map((project, index) => {
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
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <Card
              className={`overflow-hidden transition-all hover:shadow-xl group cursor-pointer ${
                templateType === "designer" ? "template-designer-card" : ""
              }`}
              onClick={() => setSelectedProject(project)}
            >
              {imageUrl ? (
                <div className="aspect-video overflow-hidden bg-muted relative group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(project.id)}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="text-white"
                    >
                      <Eye className="w-8 h-8" />
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                {displayDescription && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {displayDescription}
                  </p>
                )}
                {technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {technologies.slice(0, 5).map((tech, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs"
                      >
                        {String(tech)}
                      </Badge>
                    ))}
                    {technologies.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{technologies.length - 5}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  {githubUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-element-id={`project-${project.id}-github`}
                        data-element-type="project-link"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        Code
                      </a>
                    </Button>
                  )}
                  {liveUrl && (
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-element-id={`project-${project.id}-live`}
                        data-element-type="project-link"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Live
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>

    {/* Project Detail Modal */}
    <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        {selectedProject && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
              <DialogDescription>
                {selectedProject.short_description || selectedProject.description}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {getProjectImageUrl(selectedProject.image, selectedProject.id) && (
                  <img
                    src={getProjectImageUrl(selectedProject.image, selectedProject.id)!}
                    alt={selectedProject.title}
                    className="w-full h-auto rounded-lg"
                  />
                )}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">
                    {selectedProject.description}
                  </p>
                </div>
                {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="secondary">
                          {String(tech)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Separator />
                <div className="flex gap-2">
                  {validateProjectUrl(selectedProject.github_url) && (
                    <Button variant="outline" asChild>
                      <a
                        href={validateProjectUrl(selectedProject.github_url)!}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        View Code
                      </a>
                    </Button>
                  )}
                  {validateProjectUrl(selectedProject.live_url) && (
                    <Button asChild>
                      <a
                        href={validateProjectUrl(selectedProject.live_url)!}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Live Site
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  </ComponentErrorBoundary>
  );
}

