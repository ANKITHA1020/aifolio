import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Home,
  Loader2,
} from "lucide-react";
import { portfolioApi, templateApi, analyticsApi } from "@/lib/api";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import PortfolioNavigation from "@/components/portfolio/PortfolioNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const PublicPortfolio = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<any>(null);
  const [templateConfig, setTemplateConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"not_found" | "not_published" | "network" | null>(null);

  // Set SEO meta tags
  useEffect(() => {
    if (portfolio) {
      // Set document title
      const title = portfolio.seo_title || portfolio.meta_description || portfolio.title || "Portfolio";
      document.title = title;

      // Set meta description
      const description = portfolio.seo_description || portfolio.meta_description || "";
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", description);

      // Set meta keywords
      const keywords = portfolio.seo_keywords || portfolio.meta_keywords || "";
      if (keywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement("meta");
          metaKeywords.setAttribute("name", "keywords");
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute("content", keywords);
      }

      // Set Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        const ogTitleEl = document.createElement("meta");
        ogTitleEl.setAttribute("property", "og:title");
        document.head.appendChild(ogTitleEl);
      }
      document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        const ogDescriptionEl = document.createElement("meta");
        ogDescriptionEl.setAttribute("property", "og:description");
        document.head.appendChild(ogDescriptionEl);
      }
      document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        const ogUrlEl = document.createElement("meta");
        ogUrlEl.setAttribute("property", "og:url");
        document.head.appendChild(ogUrlEl);
      }
      document.querySelector('meta[property="og:url"]')?.setAttribute("content", window.location.href);
    }
  }, [portfolio]);

  useEffect(() => {
    if (slug) {
      loadPortfolio(slug);
    } else {
      setError("Invalid portfolio URL");
      setErrorType("not_found");
      setLoading(false);
    }
  }, [slug]);

  // Track view on mount
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

  const loadPortfolio = async (portfolioSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      setErrorType(null);

      const data = await portfolioApi.getPublicPortfolio(portfolioSlug);
      
      // Check if portfolio is published (backend should handle this, but double-check)
      if (!data.is_published) {
        setError("This portfolio is not published yet.");
        setErrorType("not_published");
        setLoading(false);
        return;
      }

      setPortfolio(data);

      // Load template config if template ID is provided
      if (data.template) {
        try {
          const template = await templateApi.getTemplate(data.template);
          setTemplateConfig(template.config || {});
        } catch (error) {
          console.warn("Failed to load template config:", error);
          // Use default config based on template_type
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
    } catch (error: any) {
      console.error("Error loading portfolio:", error);
      
      // Determine error type
      if (error.response?.status === 404) {
        setError("Portfolio not found");
        setErrorType("not_found");
      } else if (error.message?.toLowerCase().includes("network") || 
                 error.message?.toLowerCase().includes("fetch") ||
                 error.message?.toLowerCase().includes("connect")) {
        setError("Unable to connect to the server. Please try again later.");
        setErrorType("network");
      } else if (error.response?.status === 403 || error.message?.toLowerCase().includes("not published")) {
        setError("This portfolio is not published yet.");
        setErrorType("not_published");
      } else {
        setError(error.message || "Failed to load portfolio");
        setErrorType("not_found");
      }
    } finally {
      setLoading(false);
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

  // Error states
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden bg-professional-image-2">
        <div className="bg-overlay-dark"></div>
        <Card className="p-8 text-center relative z-10 max-w-md w-full mx-4">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">{error}</p>
          {errorType === "not_published" && (
            <p className="mb-6 text-sm text-muted-foreground">
              This portfolio may be private or still being set up.
            </p>
          )}
          {errorType === "network" && (
            <p className="mb-6 text-sm text-muted-foreground">
              Please check your internet connection and try again.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/")} className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="w-full sm:w-auto"
            >
              <Loader2 className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Portfolio not found</p>
          <Button className="mt-4" onClick={() => navigate("/")}>
            Return to Home
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
                  onClick={() => navigate("/")} 
                  className="gap-2 hover:bg-primary/10 transition-colors shrink-0 h-9"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
                <div className="hidden md:block h-6 w-px bg-border/60"></div>
                {portfolio.title && (
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h1 className="text-base sm:text-lg lg:text-xl font-bold truncate bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                      {portfolio.title}
                    </h1>
                    {portfolio.is_published && (
                      <Badge variant="secondary" className="hidden lg:inline-flex text-xs shrink-0">
                        Published
                      </Badge>
                    )}
                  </div>
                )}
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

      {/* Portfolio Container */}
      <div className="py-6 sm:py-8 lg:py-10 bg-gradient-to-b from-background via-background to-muted/40 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto transition-all duration-300">
            <Card className="bg-white dark:bg-gray-900 shadow-2xl border-2 border-border/60 overflow-hidden transition-all duration-500 hover:shadow-3xl ring-1 ring-border/20 rounded-2xl">
              {/* Empty State */}
              {(!portfolio.components || portfolio.components.length === 0 || 
                portfolio.components.every(c => !c.content || Object.keys(c.content).length === 0)) ? (
                <div className="min-h-[60vh] flex items-center justify-center p-8 sm:p-12">
                  <div className="text-center max-w-lg w-full">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
                      <Home className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Portfolio is Empty
                    </h2>
                    <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg px-4">
                      This portfolio doesn't have any content yet.
                    </p>
                    <Button 
                      onClick={() => navigate("/")}
                      size="lg"
                      className="shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Home className="w-5 h-5 mr-2" />
                      Return to Home
                    </Button>
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
    </div>
  );
};

export default PublicPortfolio;

