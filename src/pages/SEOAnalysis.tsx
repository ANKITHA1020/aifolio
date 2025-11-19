import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { seoApi, portfolioApi } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

const SEOAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
  const [workingImageUrl, setWorkingImageUrl] = useState<string>('');

  // Get image URLs with multiple fallback paths and cache-busting
  const getImageUrls = () => {
    const cacheBuster = import.meta.env.DEV ? `?v=${Date.now()}` : '?v=1';
    return [
      encodeURI(`/Seo page.jpg`) + cacheBuster, // URL encoded (space -> %20)
      `/Seo page.jpg${cacheBuster}`, // Original with space
      `/Seo-page.jpg${cacheBuster}`, // Hyphenated fallback
    ];
  };

  // Preload background image with multiple fallback attempts
  useEffect(() => {
    const imageUrls = getImageUrls();
    let loadedUrl = '';
    let attempts = 0;
    const maxAttempts = imageUrls.length;

    const tryLoadImage = (urlIndex: number) => {
      if (urlIndex >= maxAttempts) {
        console.warn('All SEO background image URLs failed to load:', imageUrls);
        // Still set to true to show fallback
        setBackgroundImageLoaded(true);
        setWorkingImageUrl(imageUrls[0]); // Use first URL as fallback
        return;
      }

      const img = new Image();
      const currentUrl = imageUrls[urlIndex];
      
      console.log(`Attempting to load SEO background image (${urlIndex + 1}/${maxAttempts}):`, currentUrl);
      
      img.onload = () => {
        console.log('SEO background image loaded successfully:', currentUrl);
        loadedUrl = currentUrl;
        setWorkingImageUrl(currentUrl);
        setBackgroundImageLoaded(true);
      };
      
      img.onerror = () => {
        console.warn(`Failed to load SEO background image (attempt ${urlIndex + 1}):`, currentUrl);
        attempts++;
        // Try next URL
        tryLoadImage(urlIndex + 1);
      };
      
      img.src = currentUrl;
    };

    tryLoadImage(0);
  }, []);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoadingPortfolios(true);
      const data = await portfolioApi.getPortfolios();
      // Handle paginated responses
      const portfoliosArray = Array.isArray(data) 
        ? data 
        : (data?.results || data?.data || []);
      setPortfolios(portfoliosArray);
      if (portfoliosArray.length > 0 && !selectedPortfolioId) {
        setSelectedPortfolioId(portfoliosArray[0].id);
      }
    } catch (error: any) {
      console.error('Error loading portfolios:', error);
      setPortfolios([]);
      // Don't show error toast - just handle gracefully
    } finally {
      setLoadingPortfolios(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPortfolioId) {
      toast({
        title: "Error",
        description: "Please select a portfolio",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await seoApi.analyzeSEO(selectedPortfolioId);
      setAnalysis(result);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze SEO",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  // Inline style fallback for background image
  const backgroundStyle = backgroundImageLoaded && workingImageUrl ? {
    backgroundImage: `url(${workingImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  } : {};

  return (
    <div 
      className="min-h-screen bg-background relative overflow-hidden bg-seo-image"
      style={backgroundStyle}
    >
      {/* Professional Background Overlay */}
      <div className="bg-overlay-dark"></div>
      
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 relative z-50">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-6xl relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">SEO Analysis</h1>
          <p className="text-muted-foreground">
            Analyze your portfolio for SEO optimization
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium">Select Portfolio</label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={loadPortfolios}
                  disabled={loadingPortfolios}
                  title="Refresh portfolios"
                >
                  <RefreshCw className={`h-3 w-3 ${loadingPortfolios ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {loadingPortfolios ? (
                <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading portfolios...</span>
                </div>
              ) : (
                <Select
                  value={selectedPortfolioId?.toString() || ""}
                  onValueChange={(value) => {
                    if (value !== "no-portfolios") {
                      setSelectedPortfolioId(parseInt(value));
                    }
                  }}
                  disabled={portfolios.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        portfolios.length === 0 
                          ? "No portfolios available" 
                          : "Choose a portfolio"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.length === 0 ? (
                      <SelectItem value="no-portfolios" disabled>
                        No portfolios available. Create one in the Dashboard.
                      </SelectItem>
                    ) : (
                      portfolios.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              {portfolios.length === 0 && !loadingPortfolios && (
                <p className="text-xs text-muted-foreground mt-2">
                  No portfolios found. <button 
                    onClick={() => navigate("/dashboard")}
                    className="text-primary hover:underline"
                  >
                    Create a portfolio
                  </button> to get started.
                </p>
              )}
            </div>
            <Button onClick={handleAnalyze} disabled={loading || !selectedPortfolioId || loadingPortfolios}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze SEO
                </>
              )}
            </Button>
          </div>
        </Card>

        {analysis && (
          <div className="space-y-6">
            {/* SEO Score */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">SEO Score</h2>
                <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/100
                </div>
              </div>
              <Progress value={analysis.score} className="h-3" />
            </Card>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
                    >
                      <div className="flex items-start gap-3">
                        {rec.priority === "high" ? (
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{rec.message}</p>
                          <span className="text-xs opacity-75 capitalize mt-1 block">
                            {rec.type} • {rec.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Meta Tags */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Meta Tags</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Title</span>
                  {analysis.meta_tags?.title ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Description</span>
                  {analysis.meta_tags?.description ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Keywords</span>
                  {analysis.meta_tags?.keywords ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </Card>

            {/* Content Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Content Length</h3>
                <p className="text-2xl font-bold">{analysis.content_length || 0}</p>
                <p className="text-sm text-muted-foreground">characters</p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-2">Readability Score</h3>
                <p className="text-2xl font-bold">{analysis.readability_score || 0}/100</p>
                <Progress value={analysis.readability_score || 0} className="mt-2" />
              </Card>
            </div>

            {/* Keyword Density */}
            {analysis.keyword_density &&
              Object.keys(analysis.keyword_density).length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Keyword Density</h2>
                  <div className="space-y-2">
                    {Object.entries(analysis.keyword_density)
                      .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
                      .map(([keyword, density]: [string, any]) => (
                        <div key={keyword} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="font-medium">{keyword}</span>
                          <div className="flex items-center gap-4">
                            <Progress value={Math.min(density * 10, 100)} className="w-24 h-2" />
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {density}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              )}

            {/* Links Analysis */}
            {analysis.links && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Links Analysis</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Internal Links</p>
                    <p className="text-2xl font-bold">{analysis.links.internal || 0}</p>
                  </div>
                  <div className="p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">External Links</p>
                    <p className="text-2xl font-bold">{analysis.links.external || 0}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Image Alt Text Analysis */}
            {analysis.image_alt_text && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Image Alt Text</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Total Images</span>
                    <span className="font-bold">{analysis.image_alt_text.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>With Alt Text</span>
                    <span className="font-bold text-green-500">
                      {analysis.image_alt_text.with_alt || 0}
                    </span>
                  </div>
                  <Progress 
                    value={
                      analysis.image_alt_text.total > 0
                        ? (analysis.image_alt_text.with_alt / analysis.image_alt_text.total) * 100
                        : 0
                    } 
                    className="mt-2" 
                  />
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SEOAnalysis;

