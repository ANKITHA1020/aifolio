import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Palette, Download, BarChart3, Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
  
  // Get image URL with cache-busting for development
  const getImageUrl = (path: string) => {
    const cacheBuster = import.meta.env.DEV ? `?v=${Date.now()}` : '?v=1';
    return `${path}${cacheBuster}`;
  };

  const landingBgUrl = getImageUrl('/landing-background.png.jpg');

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.src = landingBgUrl;
    img.onload = () => {
      setBackgroundImageLoaded(true);
    };
    img.onerror = () => {
      console.warn('Failed to load landing background image');
      // Still set to true to show fallback
      setBackgroundImageLoaded(true);
    };
  }, [landingBgUrl]);

  const features = [
    {
      icon: Sparkles,
      title: "AI Content Generation",
      description: "Let AI write your bio, project descriptions, and professional summary from your resume"
    },
    {
      icon: Palette,
      title: "Beautiful Templates",
      description: "Choose from stunning, modern portfolio templates that showcase your work perfectly"
    },
    {
      icon: Zap,
      title: "Instant Preview",
      description: "See changes in real-time with our live preview editor"
    },
    {
      icon: Download,
      title: "Export & Deploy",
      description: "Download as static site or deploy instantly with one click"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track visits, engagement, and optimize your portfolio performance"
    },
    {
      icon: Github,
      title: "Project Showcase",
      description: "Beautifully display your projects with AI-enhanced descriptions"
    }
  ];

  // Inline style fallback for background image
  const backgroundStyle = backgroundImageLoaded ? {
    backgroundImage: `url(${landingBgUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  } : {};

  return (
    <div 
      className="min-h-screen bg-background relative overflow-hidden bg-portfolio-minimalist"
      style={backgroundStyle}
    >
      {/* Portfolio Minimalist Background with overlay for readability */}
      <div className="bg-overlay-dark"></div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary"></div>
            <span className="text-xl font-bold">PortfolioAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 bg-mesh-gradient opacity-50"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Blurry background card for hero content */}
            <Card className="p-8 md:p-12 bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl max-w-4xl mx-auto">
              <div className="space-y-8">
                <div className="inline-block">
                  <div className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm font-medium text-primary mb-6">
                    ✨ Powered by Advanced AI
                  </div>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Build Your Dream Portfolio
                  <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
                    With AI in Minutes
                  </span>
                </h1>
                
                <p className="text-xl text-foreground/90 max-w-2xl mx-auto">
                  Let artificial intelligence transform your resume into a stunning, professional portfolio. 
                  No coding required, just pure magic.
                </p>

                <div className="flex flex-col sm:flex-row gap-10 justify-center pt-8">
                  <Button 
                    size="lg" 
                    className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-10 py-8 shadow-glow"
                    onClick={() => navigate("/auth")}
                  >
                    Start Building Free
                  </Button>
                </div>
              </div>
            </Card>

            {/* Hero Image/Animation Placeholder */}
           
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-muted/20 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-30"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <Card className="p-6 md:p-8 bg-card/60 backdrop-blur-xl border-border/50 shadow-xl max-w-3xl mx-auto">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Everything You Need
                </h2>
                <p className="text-xl text-foreground/90">
                  Powerful features to create the perfect portfolio
                </p>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 bg-card/60 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all hover:shadow-card cursor-pointer group animate-slide-up hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30"></div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <Card className="p-12 bg-gradient-card border-border/50 shadow-elevated text-center space-y-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
            <div className="absolute inset-0 bg-tech-grid opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Stand Out?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of professionals who built their portfolios with AI
              </p>
              <Button 
                size="lg"
                className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6 shadow-glow"
                onClick={() => navigate("/auth")}
              >
                Create Your Portfolio Now
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary"></div>
              <span className="text-lg font-bold">PortfolioAI</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 PortfolioAI. Built with AI & Love.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};



export default Landing;
