import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Globe,
  Eye,
  EyeOff,
  Share2,
  Loader2,
  Smartphone,
  Tablet,
  Monitor,
  Copy,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  Plus,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { portfolioApi, templateApi, projectApi, analyticsApi, blogApi } from "@/lib/api";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import PortfolioNavigation from "@/components/portfolio/PortfolioNavigation";
import { validateProjects, validateBlogPosts } from "@/utils/componentDataValidator";

const PortfolioPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [portfolio, setPortfolio] = useState<any>(null);
  const [templateConfig, setTemplateConfig] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadPortfolio(parseInt(id));
    }
  }, [id]);

  // Track view on mount and clicks
  useEffect(() => {
    if (portfolio?.id && portfolio?.is_published) {
      // Track view
      analyticsApi.trackView(portfolio.id).catch((error) => {
        console.error("Failed to track view:", error);
      });
    }
  }, [portfolio?.id, portfolio?.is_published]);

  // Track clicks on interactive elements
  const handleTrackClick = useCallback((elementId: string, elementType: string) => {
    if (portfolio?.id && portfolio?.is_published) {
      analyticsApi.trackClick(portfolio.id, elementId, elementType).catch((error) => {
        console.error("Failed to track click:", error);
      });
    }
  }, [portfolio?.id, portfolio?.is_published]);

  const loadPortfolio = async (portfolioId: number) => {
    try {
      setLoading(true);
      const data = await portfolioApi.getPortfolio(portfolioId);
      setPortfolio(data);

      // Load template config if template ID is provided
      if (data.template) {
        try {
          const template = await templateApi.getTemplate(data.template);
          setTemplateConfig(template.config || {});
        } catch (error) {
          console.warn("Failed to load template config:", error);
          // Use default config based on template_type from seed data
          const defaultConfigs: Record<string, any> = {
            classic: { primary_color: "#2563eb", secondary_color: "#64748b", font_family: "Georgia, serif" },
            modern: { primary_color: "#7c3aed", secondary_color: "#a78bfa", font_family: "Inter, sans-serif" },
            minimalist: { primary_color: "#000000", secondary_color: "#6b7280", font_family: "Helvetica, sans-serif" },
            developer: { primary_color: "#10b981", secondary_color: "#6ee7b7", font_family: "Monaco, monospace" },
            designer: { primary_color: "#f59e0b", secondary_color: "#fbbf24", font_family: "Poppins, sans-serif" },
          };
          setTemplateConfig(defaultConfigs[data.template_type] || {});
        }
      } else {
        // Use default config based on template_type
        const defaultConfigs: Record<string, any> = {
          classic: { primary_color: "#2563eb", secondary_color: "#64748b", font_family: "Georgia, serif" },
          modern: { primary_color: "#7c3aed", secondary_color: "#a78bfa", font_family: "Inter, sans-serif" },
          minimalist: { primary_color: "#000000", secondary_color: "#6b7280", font_family: "Helvetica, sans-serif" },
          developer: { primary_color: "#10b981", secondary_color: "#6ee7b7", font_family: "Monaco, monospace" },
          designer: { primary_color: "#f59e0b", secondary_color: "#fbbf24", font_family: "Poppins, sans-serif" },
        };
        setTemplateConfig(defaultConfigs[data.template_type] || defaultConfigs.modern);
      }

      // Load user projects
      try {
        const userProjects = await projectApi.getProjects();
        setProjects(userProjects);

        // Merge projects into portfolio components
        const projectsComponent = data.components?.find(
          (c: any) => c.component_type === "projects"
        );
        if (projectsComponent && userProjects.length > 0) {
          // Validate and normalize project data
          const validatedProjects = validateProjects(
            userProjects.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              short_description: p.short_description,
              image: p.image,
              github_url: p.github_url,
              live_url: p.live_url,
              technologies: p.tags?.map((t: any) => t.name) || p.technologies || [],
            }))
          );
          
          // Update the projects component with validated project data
          projectsComponent.content = {
            ...projectsComponent.content,
            projects: validatedProjects,
          };
        }
      } catch (error) {
        console.warn("Failed to load projects:", error);
      }

      // Load user blog posts
      try {
        const userBlogPosts = await blogApi.getBlogPosts();
        setBlogPosts(userBlogPosts);

        // Merge blog posts into portfolio components
        const blogComponent = data.components?.find(
          (c: any) => c.component_type === "blog"
        );
        if (blogComponent && userBlogPosts.length > 0) {
          // Validate and normalize blog post data
          const validatedPosts = validateBlogPosts(
            userBlogPosts.map((p: any) => ({
              id: p.id,
              title: p.title,
              excerpt: p.excerpt,
              content_markdown: p.content_markdown || p.content,
              featured_image: p.featured_image || p.image,
              published: p.published || false,
              published_date: p.published_date || p.created_at,
            }))
          );
          
          // Update the blog component with validated blog post data
          blogComponent.content = {
            ...blogComponent.content,
            posts: validatedPosts,
          };
        }
      } catch (error) {
        console.warn("Failed to load blog posts:", error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load portfolio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (isPublished: boolean) => {
    if (!portfolio || !id) return;

    try {
      setPublishing(true);
      await portfolioApi.publishPortfolio(parseInt(id), isPublished);
      setPortfolio((prev: any) => ({ ...prev, is_published: isPublished }));
      toast({
        title: isPublished ? "Published" : "Unpublished",
        description: isPublished
          ? "Your portfolio is now live!"
          : "Your portfolio is now private",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update portfolio",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleShare = () => {
    if (portfolio?.slug) {
      const url = `${window.location.origin}/portfolio/${portfolio.slug}`;
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Portfolio URL copied to clipboard",
      });
    }
  };

  const shareUrl = portfolio?.slug ? `${window.location.origin}/portfolio/${portfolio.slug}` : "";
  
  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(portfolio?.title || "My Portfolio");
    
    let shareUrl_platform = "";
    switch (platform) {
      case "facebook":
        shareUrl_platform = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl_platform = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "linkedin":
        shareUrl_platform = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }
    
    if (shareUrl_platform) {
      window.open(shareUrl_platform, "_blank", "width=600,height=400");
    }
  };

  const getViewportClass = () => {
    switch (viewMode) {
      case "mobile":
        return "max-w-sm mx-auto";
      case "tablet":
        return "max-w-2xl mx-auto";
      default:
        return "max-w-6xl mx-auto";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Portfolio not found</p>
          <Button className="mt-4" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "mobile" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("mobile")}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "tablet" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("tablet")}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "desktop" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("desktop")}
              >
                <Monitor className="w-4 h-4" />
              </Button>
            </div>

            {portfolio.is_published && (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleShare}>
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareToSocial("facebook")}
                    title="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareToSocial("twitter")}
                    title="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareToSocial("linkedin")}
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={() => handlePublish(!portfolio.is_published)}
              disabled={publishing}
              variant={portfolio.is_published ? "default" : "outline"}
            >
              {publishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {portfolio.is_published ? "Unpublishing..." : "Publishing..."}
                </>
              ) : portfolio.is_published ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Navigation */}
      {portfolio && portfolio.components && portfolio.components.length > 0 && portfolio.navigation_enabled !== false && (
        <PortfolioNavigation components={portfolio.components} />
      )}

      {/* Preview Container */}
      <div className="py-8 bg-muted/30">
        <div className={getViewportClass()}>
          <Card className="bg-white shadow-lg overflow-hidden">
            {/* Empty State */}
            {(!portfolio.components || portfolio.components.length === 0 || 
              portfolio.components.every(c => !c.content || Object.keys(c.content).length === 0)) ? (
              <div className="min-h-[60vh] flex items-center justify-center p-12">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Eye className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Your Portfolio is Empty</h2>
                  <p className="text-muted-foreground mb-6">
                    Add components and content to build your portfolio. You can use AI assistance to generate content automatically.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => navigate(`/portfolio-builder?id=${portfolio.id}`)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Components
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/portfolio-builder?id=${portfolio.id}`)}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Use AI to Generate Content
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <TemplateRenderer
                portfolio={portfolio}
                templateConfig={templateConfig}
                onTrackClick={handleTrackClick}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Info Bar */}
      {portfolio.is_published && (
        <div className="border-t bg-background">
          <div className="container mx-auto px-6 py-4">
            <Card className="p-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Portfolio is live</p>
                  <p className="text-xs text-muted-foreground">
                    {window.location.origin}/portfolio/{portfolio.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToSocial("facebook")}
                      title="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToSocial("twitter")}
                      title="Share on Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToSocial("linkedin")}
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPreview;

