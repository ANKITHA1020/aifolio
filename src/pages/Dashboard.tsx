import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  LogOut,
  Upload,
  Wand2,
  FileText,
  Eye,
  Loader2,
  FolderKanban,
  BookOpen,
  TrendingUp,
  Download,
  Search,
  BarChart3,
  FolderOpen,
  Globe,
  FileEdit,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi, api, portfolioApi, resumeApi, dashboardApi } from "@/lib/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [portfoliosCount, setPortfoliosCount] = useState(0);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);

  const loadPortfolios = async () => {
    try {
      setLoadingPortfolios(true);
      const data: any = await portfolioApi.getPortfolios();
      // Ensure data is an array
      const portfoliosArray = Array.isArray(data) ? data : (data?.results || data?.data || []);
      setPortfolios(portfoliosArray);
      setPortfoliosCount(portfoliosArray.length);
    } catch (error) {
      console.error('Error loading portfolios:', error);
      // Silently fail - user might not have portfolios yet
      setPortfolios([]);
      setPortfoliosCount(0);
    } finally {
      setLoadingPortfolios(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const checkUser = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000);
        });
        
        const userDataPromise = authApi.getCurrentUser();
        const userData = await Promise.race([userDataPromise, timeoutPromise]) as any;
        
        if (!isMounted) return;
        
        console.log('User data:', userData); // Debug log
        
        // Handle different response formats
        if (userData && (userData.user || userData.id || userData.email)) {
          setUser(userData.user || userData);
          setLoading(false);
          // Load portfolios after user is loaded
          await loadPortfolios();
        } else {
          throw new Error('Invalid user data received');
        }
      } catch (error: any) {
        console.error('Auth error:', error); // Debug log
        if (!isMounted) return;
        
        // Not authenticated - clear tokens and redirect
        api.clearTokens();
        setLoading(false);
        navigate("/auth", { replace: true });
      }
    };

    checkUser();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await authApi.logout();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate("/");
    } catch (error) {
      // Even if logout fails, clear tokens and redirect
      api.clearTokens();
      navigate("/");
    }
  };

  // Always render something, even if loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Safety check - if user is null but not loading, something went wrong
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold mb-4">Unable to load dashboard</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading your account information.
          </p>
          <Button onClick={() => navigate("/auth", { replace: true })}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  const quickActions = [
    {
      icon: Upload,
      title: "Upload Resume",
      description: "Let AI extract your information",
      action: () => navigate("/upload-resume"),
      gradient: "from-primary to-secondary"
    },
    {
      icon: Wand2,
      title: "Generate Content",
      description: "AI-powered bio and descriptions",
      action: () => navigate("/generate-content"),
      gradient: "from-secondary to-accent"
    },
    {
      icon: FileText,
      title: "Choose Template",
      description: "Pick your perfect design",
      action: () => navigate("/choose-template"),
      gradient: "from-accent to-primary"
    },
    {
      icon: Eye,
      title: "Preview Portfolio",
      description: "See your portfolio live",
      action: () => {
        if (Array.isArray(portfolios) && portfolios.length > 0) {
          navigate(`/portfolio-preview/${portfolios[0].id}`);
        } else {
          navigate("/choose-template");
        }
      },
      gradient: "from-primary to-accent"
    },
    {
      icon: FolderKanban,
      title: "Projects",
      description: "Manage your projects",
      action: () => navigate("/projects"),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: BookOpen,
      title: "Blog Posts",
      description: "Manage your blog",
      action: () => navigate("/blog-posts"),
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Search,
      title: "SEO Analysis",
      description: "Analyze your SEO",
      action: () => navigate("/seo-analysis"),
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "View portfolio stats",
      action: () => navigate("/analytics"),
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Download,
      title: "Export",
      description: "Export your portfolio",
      action: () => navigate("/export"),
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden bg-professional-image-2">
      {/* Professional Background Overlay */}
      <div className="bg-overlay-dark"></div>
      
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/90 relative z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">PortfolioAI</span>
          </div>
          <Button variant="ghost" onClick={handleSignOut} className="hover:bg-primary/10 hover:text-primary transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl relative z-10">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <Card className="p-8 md:p-10 bg-gradient-card border-border/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
            <div className="absolute inset-0 bg-tech-grid opacity-20"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      Welcome back!
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-foreground/80 font-medium">
                    {user?.email || user?.profile?.email || 'User'}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-muted-foreground">
                  Ready to build something amazing? Let's create your next portfolio masterpiece.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-card border-border/50 backdrop-blur-md hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                {loadingPortfolios ? (
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                ) : (
                  portfoliosCount
                )}
              </div>
              <div className="text-muted-foreground font-medium">Portfolios Created</div>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-card border-border/50 backdrop-blur-md hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                {Array.isArray(portfolios) ? portfolios.filter((p) => p.is_published).length : 0}
              </div>
              <div className="text-muted-foreground font-medium">Published</div>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-card border-border/50 backdrop-blur-md hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FileEdit className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                {Array.isArray(portfolios) ? portfolios.filter((p) => !p.is_published).length : 0}
              </div>
              <div className="text-muted-foreground font-medium">Drafts</div>
            </div>
          </Card>
        </div>

        {/* Recent Portfolios */}
        {Array.isArray(portfolios) && portfolios.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold">Recent Portfolios</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.slice(0, 6).map((portfolio) => (
                <Card
                  key={portfolio.id}
                  className="p-6 cursor-pointer hover:border-primary/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden bg-gradient-card border-border/50 backdrop-blur-md"
                  onClick={() => navigate(`/portfolio-preview/${portfolio.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                          {portfolio.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {portfolio.template_type || 'Standard'} template
                        </p>
                      </div>
                      {portfolio.is_published && (
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          Live
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/portfolio-preview/${portfolio.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/portfolio-builder?id=${portfolio.id}`);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold">Quick Actions</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="p-6 bg-gradient-card border-border/50 backdrop-blur-xl hover:border-primary/50 transition-all hover:shadow-2xl cursor-pointer group hover:scale-105 relative overflow-hidden"
                onClick={action.action}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{action.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <Card className="p-8 md:p-10 bg-gradient-card border-border/50 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
          <div className="absolute inset-0 bg-tech-grid opacity-20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-1">Getting Started</h2>
                <p className="text-muted-foreground">Create your first AI-powered portfolio in just a few steps</p>
              </div>
            </div>
            <ol className="space-y-4 mb-8">
              <li className="flex items-start gap-4 p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">1</div>
                <span className="pt-2 text-foreground/90 font-medium">Upload your resume or enter your information manually</span>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">2</div>
                <span className="pt-2 text-foreground/90 font-medium">Let AI generate professional content for your portfolio</span>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">3</div>
                <span className="pt-2 text-foreground/90 font-medium">Choose a template and customize your design</span>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">4</div>
                <span className="pt-2 text-foreground/90 font-medium">Publish and share your portfolio with the world</span>
              </li>
            </ol>
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6 shadow-glow w-full md:w-auto"
              onClick={() => navigate("/upload-resume")}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Building Now
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
