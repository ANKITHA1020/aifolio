import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalistTemplate from "./MinimalistTemplate";
import DeveloperTemplate from "./DeveloperTemplate";
import DesignerTemplate from "./DesignerTemplate";
import { applyTemplateStyles } from "@/utils/templateStyles";
import { useEffect, useRef } from "react";
import { normalizeComponentContent } from "@/utils/componentDataValidator";
import ComponentErrorBoundary from "@/components/portfolio/ComponentErrorBoundary";

interface Component {
  component_type: string;
  content: Record<string, any>;
}

interface TemplateRendererProps {
  portfolio: {
    id?: number;
    title: string;
    template_type: string;
    template?: number | null;
    custom_settings?: Record<string, any>;
    components: Component[];
    profile_photo_url?: string | null;
    user_profile_photo_url?: string | null;
  };
  templateConfig?: Record<string, any>;
  onTrackClick?: (elementId: string, elementType: string) => void;
}

export default function TemplateRenderer({ portfolio, templateConfig, onTrackClick }: TemplateRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const templateType = portfolio.template_type || "modern";

  useEffect(() => {
    if (containerRef.current && templateConfig) {
      applyTemplateStyles(containerRef.current, templateConfig);
    }
  }, [templateConfig]);

  // Track clicks on interactive elements
  useEffect(() => {
    if (!containerRef.current || !onTrackClick) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a, button, [role="button"]') as HTMLElement;
      
      if (link) {
        const elementId = link.id || link.getAttribute('data-element-id') || link.className;
        const elementType = link.getAttribute('data-element-type') || 
          (link.tagName === 'A' ? 'link' : link.tagName === 'BUTTON' ? 'button' : 'interactive');
        
        if (elementId) {
          onTrackClick(elementId, elementType);
        }
      }
    };

    containerRef.current.addEventListener('click', handleClick);
    return () => {
      containerRef.current?.removeEventListener('click', handleClick);
    };
  }, [onTrackClick]);

  // Ensure portfolio has components array and validate/normalize component data
  if (!portfolio.components || !Array.isArray(portfolio.components)) {
    portfolio.components = [];
  }

  // Normalize and validate all component content
  const normalizedPortfolio = {
    ...portfolio,
    components: portfolio.components.map((component: any) => {
      try {
        const normalizedContent = normalizeComponentContent(component);
        return {
          ...component,
          content: normalizedContent,
        };
      } catch (error) {
        console.warn(`Failed to normalize component ${component.component_type}:`, error);
        return component; // Return original component if normalization fails
      }
    }).filter((component: any) => {
      // Filter out components that are explicitly hidden or have no content
      if (component.is_visible === false) {
        return false;
      }
      
      // Filter out components with empty content (optional - can be removed if you want to show empty states)
      const content = component.content || {};
      const hasContent = Object.keys(content).length > 0 && 
        Object.values(content).some((val: any) => {
          if (Array.isArray(val)) return val.length > 0;
          if (typeof val === 'string') return val.trim().length > 0;
          if (typeof val === 'object' && val !== null) return Object.keys(val).length > 0;
          return val !== null && val !== undefined;
        });
      
      return hasContent;
    }),
  };

  const renderTemplate = () => {
    switch (templateType) {
      case "classic":
        return (
          <ComponentErrorBoundary componentName="Classic Template">
            <ClassicTemplate portfolio={normalizedPortfolio} templateConfig={templateConfig} />
          </ComponentErrorBoundary>
        );
      case "modern":
        return (
          <ComponentErrorBoundary componentName="Modern Template">
            <ModernTemplate portfolio={normalizedPortfolio} templateConfig={templateConfig} />
          </ComponentErrorBoundary>
        );
      case "minimalist":
        return (
          <ComponentErrorBoundary componentName="Minimalist Template">
            <MinimalistTemplate portfolio={normalizedPortfolio} templateConfig={templateConfig} />
          </ComponentErrorBoundary>
        );
      case "developer":
        return (
          <ComponentErrorBoundary componentName="Developer Template">
            <DeveloperTemplate portfolio={normalizedPortfolio} templateConfig={templateConfig} />
          </ComponentErrorBoundary>
        );
      case "designer":
        return (
          <ComponentErrorBoundary componentName="Designer Template">
            <DesignerTemplate portfolio={normalizedPortfolio} templateConfig={templateConfig} />
          </ComponentErrorBoundary>
        );
      default:
        return (
          <ComponentErrorBoundary componentName="Modern Template">
            <ModernTemplate portfolio={normalizedPortfolio} templateConfig={templateConfig} />
          </ComponentErrorBoundary>
        );
    }
  };

  return <div ref={containerRef}>{renderTemplate()}</div>;
}

