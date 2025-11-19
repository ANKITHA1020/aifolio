import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Component {
  id?: number;
  component_type: string;
  order: number;
  is_visible: boolean;
}

interface PortfolioNavigationProps {
  components: Component[];
  className?: string;
  sticky?: boolean;
}

export default function PortfolioNavigation({
  components,
  className,
  sticky = true,
}: PortfolioNavigationProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Filter visible components and sort by order
  const visibleComponents = components
    .filter((c) => c.is_visible)
    .sort((a, b) => a.order - b.order);

  // Component type to display name mapping
  const componentNames: Record<string, string> = {
    header: "Home",
    hero_banner: "Home",
    about: "About",
    about_me_card: "About",
    skills: "Skills",
    skills_cloud: "Skills",
    experience_timeline: "Experience",
    projects: "Projects",
    project_grid: "Projects",
    services_section: "Services",
    achievements_counters: "Achievements",
    testimonials_carousel: "Testimonials",
    blog: "Blog",
    blog_preview_grid: "Blog",
    contact: "Contact",
    contact_form: "Contact",
    footer: "Footer",
  };

  // Scroll to section
  const scrollToSection = (componentType: string) => {
    const element = document.getElementById(`section-${componentType}`);
    if (element) {
      // Calculate total header height (top nav + section nav)
      const topNav = document.querySelector('header')?.offsetHeight || 0;
      const navHeight = navRef.current?.offsetHeight || 0;
      const totalHeaderHeight = topNav || (navHeight + 80); // Fallback if header not found
      
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - totalHeaderHeight - 20;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });

      setActiveSection(componentType);
      setMobileMenuOpen(false);
    }
  };

  // Detect active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = visibleComponents.map((c) => c.component_type);
      // Account for unified header height
      const topNav = document.querySelector('header')?.offsetHeight || 0;
      const scrollPosition = window.scrollY + (topNav || 150);

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(`section-${sections[i]}`);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleComponents]);

  if (visibleComponents.length === 0) return null;

  return (
    <nav
      ref={navRef}
      className={cn(
        "transition-all",
        sticky && "sticky top-0 z-40 bg-background/98 backdrop-blur-xl border-b-2 border-border/60 shadow-sm",
        !sticky && "border-b border-border/40",
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {visibleComponents.map((component) => {
              const name = componentNames[component.component_type] || component.component_type.replace(/_/g, ' ');
              const isActive = activeSection === component.component_type;

              return (
                <Button
                  key={component.id || component.component_type}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => scrollToSection(component.component_type)}
                  className={cn(
                    "transition-all duration-200 font-medium",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "hover:bg-muted/50"
                  )}
                >
                  {name}
                </Button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-border/60 py-3 bg-muted/30">
            <div className="flex flex-col gap-1.5">
              {visibleComponents.map((component) => {
                const name = componentNames[component.component_type] || component.component_type.replace(/_/g, ' ');
                const isActive = activeSection === component.component_type;

                return (
                  <Button
                    key={component.id || component.component_type}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => scrollToSection(component.component_type)}
                    className={cn(
                      "justify-start w-full transition-all duration-200 font-medium",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    {name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

