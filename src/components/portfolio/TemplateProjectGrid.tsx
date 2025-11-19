import { useState, useMemo } from "react";
import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { ExternalLink, Github } from "lucide-react";

interface Project {
  id?: number;
  title?: string;
  description?: string;
  short_description?: string;
  image?: string;
  github_url?: string;
  live_url?: string;
  technologies?: string[];
}

interface ProjectGridProps {
  projects: Project[];
  filterCategories?: string[];
  showFilters?: boolean;
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateProjectGrid({
  projects = [],
  filterCategories = [],
  showFilters = true,
  templateType,
  config,
}: ProjectGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set<string>();
    projects.forEach((project) => {
      if (project.technologies) {
        project.technologies.forEach((tech) => cats.add(tech));
      }
    });
    return Array.from(cats);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") return projects;
    return projects.filter(
      (project) =>
        project.technologies &&
        project.technologies.includes(selectedCategory)
    );
  }, [projects, selectedCategory]);

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <ComponentErrorBoundary componentName="Project Grid">
      <section id="section-project_grid" className={`project-grid project-grid-${templateType}`}>
        <div className="project-grid-container">
          <h2 className="project-grid-title">Projects</h2>
          {showFilters && categories.length > 0 && (
            <div className="project-grid-filters">
              <button
                className={`project-grid-filter ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`project-grid-filter ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          <div className="project-grid-list">
            {filteredProjects.map((project, idx) => (
              <div key={project.id || idx} className="project-grid-item">
                {project.image && (
                  <div className="project-grid-image-wrapper">
                    <img
                      src={project.image}
                      alt={project.title || "Project"}
                      className="project-grid-image"
                    />
                    <div className="project-grid-overlay">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-grid-link"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-grid-link"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <div className="project-grid-content">
                  <h3 className="project-grid-item-title">
                    {project.title || "Untitled Project"}
                  </h3>
                  <p className="project-grid-item-description">
                    {project.short_description || project.description}
                  </p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="project-grid-item-tags">
                      {project.technologies.map((tech, techIdx) => (
                        <span key={techIdx} className="project-grid-item-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
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

