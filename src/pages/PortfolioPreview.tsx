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
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        return "max-w-sm mx-auto transition-all duration-300 shadow-lg";
      case "tablet":
        return "max-w-2xl mx-auto transition-all duration-300 shadow-lg";
      default:
        return "max-w-6xl mx-auto transition-all duration-300";
    }
  };

  // Enhanced loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80">
          <div className="container mx-auto px-6 py-4">
            <Skeleton className="h-10 w-32" />
          </div>
        </nav>
        <div className="py-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-white shadow-lg overflow-hidden">
              <div className="space-y-8 p-8">
                <Skeleton className="h-64 w-full" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden bg-professional-image-3">
      {/* Professional Background Overlay */}
      <div className="bg-overlay-light"></div>
      
      {/* Unified Two-Tier Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/98 backdrop-blur-xl border-b-2 border-border/60 shadow-lg relative">
        {/* Top Tier: Main Navigation */}
        <nav className="border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Back Button & Portfolio Title */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/dashboard")} 
                  className="gap-2 hover:bg-primary/10 transition-colors shrink-0 h-9"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/")} 
                  className="gap-2 hover:bg-primary/10 transition-colors shrink-0 h-9"
                >
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Home</span>
                </Button>
                <div className="hidden md:block h-6 w-px bg-border/60"></div>
                {portfolio.title && (
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h1 className="text-base sm:text-lg lg:text-xl font-bold truncate bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                      {portfolio.title}
                    </h1>
                    <Badge variant="secondary" className="hidden lg:inline-flex text-xs shrink-0">
                      Preview
                    </Badge>
                  </div>
                )}
              </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* View Mode Selector */}
                <TooltipProvider>
                  <div className="flex items-center gap-1 border-2 border-border/60 rounded-xl p-1 bg-background/90 backdrop-blur-sm shadow-sm ring-1 ring-border/30">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === "mobile" ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("mobile")}
                          className="h-7 w-7 transition-all"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Mobile View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === "tablet" ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("tablet")}
                          className="h-7 w-7 transition-all"
                        >
                          <Tablet className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Tablet View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === "desktop" ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("desktop")}
                          className="h-7 w-7 transition-all"
                        >
                          <Monitor className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Desktop View</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>

                {portfolio.is_published && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-all hidden sm:flex">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={handleShare}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => shareToSocial("facebook")}>
                        <Facebook className="w-4 h-4 mr-2" />
                        Facebook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => shareToSocial("twitter")}>
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => shareToSocial("linkedin")}>
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button
                  onClick={() => handlePublish(!portfolio.is_published)}
                  disabled={publishing}
                  variant={portfolio.is_published ? "default" : "outline"}
                  size="sm"
                  className="shadow-sm hover:shadow-md transition-all font-semibold"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">{portfolio.is_published ? "Unpublishing..." : "Publishing..."}</span>
                    </>
                  ) : portfolio.is_published ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Unpublish</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Publish</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom Tier: Section Navigation */}
        {portfolio && portfolio.components && portfolio.components.length > 0 && portfolio.navigation_enabled !== false && (
          <div className="bg-background/95 backdrop-blur-sm">
            <PortfolioNavigation components={portfolio.components} sticky={false} />
          </div>
        )}
      </header>

      {/* Preview Container */}
      <div className="py-6 sm:py-8 lg:py-10 bg-gradient-to-b from-background via-background to-muted/40 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={getViewportClass()}>
            <Card className="bg-white dark:bg-gray-900 shadow-2xl border-2 border-border/60 overflow-hidden transition-all duration-500 hover:shadow-3xl ring-1 ring-border/20 rounded-2xl">
              {/* Empty State */}
              {(!portfolio.components || portfolio.components.length === 0 || 
                portfolio.components.every(c => !c.content || Object.keys(c.content).length === 0)) ? (
                <div className="min-h-[60vh] flex items-center justify-center p-8 sm:p-12">
                  <div className="text-center max-w-lg w-full">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
                      <Eye className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Your Portfolio is Empty
                    </h2>
                    <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg px-4">
                      Add components and content to build your portfolio. You can use AI assistance to generate content automatically.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                      <Button 
                        onClick={() => navigate(`/portfolio-builder?id=${portfolio.id}`)}
                        size="lg"
                        className="shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Components
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(`/portfolio-builder?id=${portfolio.id}`)}
                        size="lg"
                        className="shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Use AI to Generate Content
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="transition-all duration-500 ease-in-out">
                  <div className="relative">
                    {/* Decorative top border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-10"></div>
                    <TemplateRenderer
                      portfolio={portfolio}
                      templateConfig={templateConfig}
                      onTrackClick={handleTrackClick}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      {portfolio.is_published && (
        <div className="border-t-2 border-border/60 bg-gradient-to-b from-background via-muted/30 to-muted/40 mt-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
            <Card className="p-5 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/30 shadow-xl ring-1 ring-primary/10 rounded-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
                    </div>
                    <p className="text-sm font-bold text-foreground">Portfolio is live</p>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground font-mono break-all bg-muted/50 px-2 py-1 rounded truncate">
                      {window.location.origin}/portfolio/{portfolio.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleShare}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Copy Link</span>
                      </>
                    )}
                  </Button>
                  <div className="flex items-center gap-1.5 sm:gap-2 border-l pl-2 sm:pl-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToSocial("facebook")}
                      title="Share on Facebook"
                      className="shadow-sm hover:shadow-md transition-shadow h-8 w-8 p-0"
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToSocial("twitter")}
                      title="Share on Twitter"
                      className="shadow-sm hover:shadow-md transition-shadow h-8 w-8 p-0"
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToSocial("linkedin")}
                      title="Share on LinkedIn"
                      className="shadow-sm hover:shadow-md transition-shadow h-8 w-8 p-0"
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

