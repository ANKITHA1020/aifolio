import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Search,
  ExternalLink,
  Github,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { projectApi } from "@/lib/api";
import { Switch } from "@/components/ui/switch";

interface Project {
  id: number;
  title: string;
  description: string;
  short_description: string;
  image: string | null;
  category: { id: number; name: string } | null;
  tags: Array<{ id: number; name: string }>;
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

// Mock projects data for demonstration
const mockProjects: Project[] = [
  {
    id: -1,
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce platform built with modern web technologies. Features include user authentication, product catalog, shopping cart, payment integration, and admin dashboard. The platform supports multiple payment methods and provides real-time inventory management.",
    short_description: "Full-stack e-commerce platform with payment integration and admin dashboard",
    image: null,
    category: { id: 1, name: "Web Application" },
    tags: [
      { id: 1, name: "React" },
      { id: 2, name: "Node.js" },
      { id: 3, name: "MongoDB" },
      { id: 4, name: "Express" },
      { id: 5, name: "Stripe API" }
    ],
    github_url: "https://github.com/example/ecommerce-platform",
    live_url: "https://ecommerce-demo.example.com",
    featured: false,
    order: 1,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: -2,
    title: "Task Management App",
    description: "A collaborative task management application designed for teams. Includes features like project boards, task assignments, deadlines, progress tracking, and team collaboration tools. Built with Vue.js for the frontend and Express.js for the backend, with real-time updates using WebSockets.",
    short_description: "Collaborative task management app with real-time updates and team collaboration",
    image: null,
    category: { id: 1, name: "Web Application" },
    tags: [
      { id: 6, name: "Vue.js" },
      { id: 7, name: "Express" },
      { id: 8, name: "PostgreSQL" },
      { id: 9, name: "WebSockets" },
      { id: 10, name: "TypeScript" }
    ],
    github_url: "https://github.com/example/task-manager",
    live_url: "https://tasks-demo.example.com",
    featured: false,
    order: 2,
    created_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: -3,
    title: "Weather Dashboard",
    description: "A beautiful weather dashboard application that displays current weather conditions and forecasts. Features include location-based weather data, interactive maps, weather alerts, and customizable widgets. Built with React and TypeScript for type safety and excellent developer experience.",
    short_description: "Interactive weather dashboard with forecasts and location-based data",
    image: null,
    category: { id: 2, name: "Dashboard" },
    tags: [
      { id: 1, name: "React" },
      { id: 10, name: "TypeScript" },
      { id: 11, name: "OpenWeather API" },
      { id: 12, name: "Chart.js" }
    ],
    github_url: "https://github.com/example/weather-dashboard",
    live_url: "https://weather-demo.example.com",
    featured: false,
    order: 3,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: -4,
    title: "Social Media Analytics Tool",
    description: "A comprehensive analytics platform for social media management. Provides insights into engagement metrics, audience demographics, content performance, and competitor analysis. Built with Next.js for server-side rendering and optimal performance, with Python backend for data processing.",
    short_description: "Social media analytics platform with engagement metrics and insights",
    image: null,
    category: { id: 3, name: "Analytics" },
    tags: [
      { id: 13, name: "Next.js" },
      { id: 14, name: "Python" },
      { id: 15, name: "Redis" },
      { id: 16, name: "D3.js" },
      { id: 17, name: "PostgreSQL" }
    ],
    github_url: "https://github.com/example/social-analytics",
    live_url: "https://analytics-demo.example.com",
    featured: false,
    order: 4,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: -5,
    title: "Portfolio Website Builder",
    description: "An intuitive drag-and-drop portfolio website builder that allows users to create stunning portfolios without coding. Features include multiple templates, custom themes, responsive design, SEO optimization, and one-click deployment. Built with React and Tailwind CSS for modern, responsive designs.",
    short_description: "Drag-and-drop portfolio builder with templates and custom themes",
    image: null,
    category: { id: 1, name: "Web Application" },
    tags: [
      { id: 1, name: "React" },
      { id: 18, name: "Tailwind CSS" },
      { id: 19, name: "Framer Motion" },
      { id: 20, name: "Firebase" }
    ],
    github_url: "https://github.com/example/portfolio-builder",
    live_url: "https://portfolio-builder-demo.example.com",
    featured: true,
    order: 0,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: -6,
    title: "AI Chatbot Interface",
    description: "An intelligent chatbot interface powered by OpenAI's GPT models. Features include natural language processing, context-aware conversations, multi-language support, and customizable personality. The interface is built with React and provides a smooth, conversational user experience.",
    short_description: "Intelligent chatbot interface with GPT integration and natural language processing",
    image: null,
    category: { id: 4, name: "AI/ML" },
    tags: [
      { id: 1, name: "React" },
      { id: 10, name: "TypeScript" },
      { id: 21, name: "OpenAI API" },
      { id: 22, name: "WebSockets" }
    ],
    github_url: "https://github.com/example/ai-chatbot",
    live_url: "https://chatbot-demo.example.com",
    featured: true,
    order: 0,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const Projects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiTechnologies, setAiTechnologies] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    image: null as File | null,
    category: "",
    tag_names: "",
    github_url: "",
    live_url: "",
    featured: false,
    order: 0,
  });

  useEffect(() => {
    loadProjects();
    loadCategories();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjects();
      const loadedProjects = Array.isArray(data) ? data : [];
      // Use mock data if no projects are loaded
      setProjects(loadedProjects.length > 0 ? loadedProjects : mockProjects);
    } catch (error: any) {
      // On error, use mock data as fallback
      console.warn("Failed to load projects from API, using mock data:", error);
      setProjects(mockProjects);
      toast({
        title: "Info",
        description: "Using demo projects. Connect to backend to manage your own projects.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await projectApi.getProjectCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setAiTechnologies("");
    setFormData({
      title: "",
      description: "",
      short_description: "",
      image: null,
      category: "",
      tag_names: "",
      github_url: "",
      live_url: "",
      featured: false,
      order: projects.length,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (project: Project) => {
    // Prevent editing mock projects
    if (project.id < 0) {
      toast({
        title: "Info",
        description: "This is a demo project. Create your own project to edit it.",
        variant: "default",
      });
      return;
    }
    setEditingProject(project);
    const techTags = project.tags.map((t) => t.name).join(", ");
    setAiTechnologies(techTags);
    setFormData({
      title: project.title,
      description: project.description,
      short_description: project.short_description || "",
      image: null,
      category: project.category?.id.toString() || "",
      tag_names: techTags,
      github_url: project.github_url || "",
      live_url: project.live_url || "",
      featured: project.featured,
      order: project.order,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const data = {
        ...formData,
        category: formData.category ? parseInt(formData.category) : undefined,
        tag_names: formData.tag_names
          ? formData.tag_names.split(",").map((t) => t.trim())
          : [],
        image: formData.image || undefined,
      };

      if (editingProject) {
        await projectApi.updateProject(editingProject.id, data);
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        await projectApi.createProject(data);
        toast({
          title: "Success",
          description: "Project created successfully",
        });
      }

      setIsDialogOpen(false);
      await loadProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save project",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Prevent deleting mock projects
    if (id < 0) {
      toast({
        title: "Info",
        description: "This is a demo project. Create your own project to delete it.",
        variant: "default",
      });
      return;
    }
    
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await projectApi.deleteProject(id);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      await loadProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden bg-professional-image">
      {/* Professional Background Overlay */}
      <div className="bg-overlay-light"></div>
      
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 relative z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage your portfolio projects</p>
        </div>

        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No projects found</p>
            <Button className="mt-4" onClick={handleCreate}>
              Create Your First Project
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                    {project.featured && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.short_description || project.description}
                  </p>
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 bg-muted rounded text-xs"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {project.github_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(project.github_url!, "_blank")}
                        title="View on GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </Button>
                    )}
                    {project.live_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(project.live_url!, "_blank")}
                        title="View Live Site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(project)}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      className="text-destructive hover:text-destructive"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "Create New Project"}
            </DialogTitle>
            <DialogDescription>
              {editingProject
                ? "Update your project information"
                : "Add a new project to your portfolio"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Project Title"
              />
            </div>

            {/* AI Generation Section */}
            {formData.title && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">AI Content Generation</span>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Technologies (comma-separated)</Label>
                    <Input
                      value={aiTechnologies}
                      onChange={(e) => setAiTechnologies(e.target.value)}
                      placeholder="e.g., React, Node.js, TypeScript, MongoDB"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!formData.title.trim()) {
                        toast({
                          title: "Error",
                          description: "Please enter a project title first",
                          variant: "destructive",
                        });
                        return;
                      }
                      try {
                        setGeneratingAI(true);
                        const technologies = aiTechnologies
                          .split(',')
                          .map(t => t.trim())
                          .filter(t => t);
                        const result = await projectApi.generateProjectDescription({
                          title: formData.title,
                          technologies: technologies,
                        });
                        setFormData({
                          ...formData,
                          description: result.description,
                          short_description: result.short_description,
                        });
                        toast({
                          title: "Success",
                          description: "Project descriptions generated successfully",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to generate descriptions",
                          variant: "destructive",
                        });
                      } finally {
                        setGeneratingAI(false);
                      }
                    }}
                    disabled={generatingAI || !formData.title.trim()}
                    className="w-full"
                  >
                    {generatingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Descriptions with AI
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            <div>
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) =>
                  setFormData({ ...formData, short_description: e.target.value })
                }
                placeholder="Brief description (max 300 characters)"
                maxLength={300}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Full project description"
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="image">Project Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    image: e.target.files?.[0] || null,
                  })
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tag_names">Tags (comma-separated)</Label>
              <Input
                id="tag_names"
                value={formData.tag_names}
                onChange={(e) =>
                  setFormData({ ...formData, tag_names: e.target.value })
                }
                placeholder="e.g., React, Node.js, TypeScript"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  type="url"
                  value={formData.github_url}
                  onChange={(e) =>
                    setFormData({ ...formData, github_url: e.target.value })
                  }
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <Label htmlFor="live_url">Live URL</Label>
                <Input
                  id="live_url"
                  type="url"
                  value={formData.live_url}
                  onChange={(e) =>
                    setFormData({ ...formData, live_url: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
                }
              />
              <Label>Featured Project</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;

