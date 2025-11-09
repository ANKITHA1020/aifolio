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
      const data = await portfolioApi.getPortfolios();
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary"></div>
            <span className="text-xl font-bold">PortfolioAI</span>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back!
          </h1>
          <p className="text-xl text-muted-foreground">
            {user?.email || user?.profile?.email || 'User'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-card border-border/50 backdrop-blur-sm">
            <div className="text-3xl font-bold mb-2">
              {loadingPortfolios ? (
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              ) : (
                portfoliosCount
              )}
            </div>
            <div className="text-muted-foreground">Portfolios Created</div>
          </Card>
          <Card className="p-6 bg-gradient-card border-border/50 backdrop-blur-sm">
            <div className="text-3xl font-bold mb-2">
              {Array.isArray(portfolios) ? portfolios.filter((p) => p.is_published).length : 0}
            </div>
            <div className="text-muted-foreground">Published</div>
          </Card>
          <Card className="p-6 bg-gradient-card border-border/50 backdrop-blur-sm">
            <div className="text-3xl font-bold mb-2">
              {Array.isArray(portfolios) ? portfolios.filter((p) => !p.is_published).length : 0}
            </div>
            <div className="text-muted-foreground">Drafts</div>
          </Card>
        </div>

        {/* Recent Portfolios */}
        {Array.isArray(portfolios) && portfolios.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Recent Portfolios</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.slice(0, 6).map((portfolio) => (
                <Card
                  key={portfolio.id}
                  className="p-6 cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => navigate(`/portfolio-preview/${portfolio.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold truncate">{portfolio.title}</h3>
                    {portfolio.is_published && (
                      <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {portfolio.template_type} template
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/portfolio-builder?id=${portfolio.id}`);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all hover:shadow-card cursor-pointer group"
                onClick={action.action}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <Card className="p-8 bg-gradient-card border-border/50 shadow-elevated relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Getting Started</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Create your first AI-powered portfolio in just a few steps:
            </p>
            <ol className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                <span>Upload your resume or enter your information manually</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                <span>Let AI generate professional content for your portfolio</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                <span>Choose a template and customize your design</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                <span>Publish and share your portfolio with the world</span>
              </li>
            </ol>
            <Button
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
              onClick={() => navigate("/upload-resume")}
            >
              Start Building Now
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
