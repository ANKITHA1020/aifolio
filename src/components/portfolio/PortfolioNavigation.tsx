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
    about: "About",
    skills: "Skills",
    projects: "Projects",
    blog: "Blog",
    contact: "Contact",
  };

  // Scroll to section
  const scrollToSection = (componentType: string) => {
    const element = document.getElementById(`section-${componentType}`);
    if (element) {
      const navHeight = navRef.current?.offsetHeight || 0;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20;

      window.scrollTo({
        top: offsetPosition,
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
      const scrollPosition = window.scrollY + 150;

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
        "bg-background/95 backdrop-blur-sm border-b z-50 transition-all",
        sticky && "sticky top-0",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {visibleComponents.map((component) => {
              const name = componentNames[component.component_type] || component.component_type;
              const isActive = activeSection === component.component_type;

              return (
                <Button
                  key={component.id || component.component_type}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => scrollToSection(component.component_type)}
                  className={cn(
                    "transition-colors",
                    isActive && "bg-primary text-primary-foreground"
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
          <div className="md:hidden border-t py-2">
            <div className="flex flex-col gap-1">
              {visibleComponents.map((component) => {
                const name = componentNames[component.component_type] || component.component_type;
                const isActive = activeSection === component.component_type;

                return (
                  <Button
                    key={component.id || component.component_type}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => scrollToSection(component.component_type)}
                    className={cn(
                      "justify-start w-full",
                      isActive && "bg-primary text-primary-foreground"
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

