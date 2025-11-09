import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Monitor, Tablet, Smartphone, X } from "lucide-react";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import { getExampleDataForTemplate } from "@/utils/templateExampleData";
import { cn } from "@/lib/utils";

interface Template {
  id: number;
  name: string;
  type: string;
  description: string;
  config: Record<string, any>;
}

interface TemplatePreviewProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ViewportSize = "desktop" | "tablet" | "mobile";

export default function TemplatePreview({
  template,
  open,
  onOpenChange,
}: TemplatePreviewProps) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
  const [examplePortfolio, setExamplePortfolio] = useState<any>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Load example data when template changes
  useEffect(() => {
    if (template && open) {
      const exampleData = getExampleDataForTemplate(template.type);
      setExamplePortfolio(exampleData);
    }
  }, [template, open]);

  // Reset viewport when dialog opens
  useEffect(() => {
    if (open) {
      setViewportSize("desktop");
    }
  }, [open]);

  // Focus management for accessibility
  useEffect(() => {
    if (open && previewContainerRef.current) {
      // Focus the preview container when dialog opens
      const timer = setTimeout(() => {
        previewContainerRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!template) return null;

  const getViewportClass = () => {
    switch (viewportSize) {
      case "tablet":
        return "max-w-3xl mx-auto";
      case "mobile":
        return "max-w-sm mx-auto";
      default:
        return "max-w-6xl mx-auto";
    }
  };

  const getPreviewScale = () => {
    switch (viewportSize) {
      case "tablet":
        return "scale-90";
      case "mobile":
        return "scale-75";
      default:
        return "scale-100";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape key handled by Dialog component
    // Arrow keys for viewport navigation
    if (e.key === "ArrowLeft" && viewportSize !== "desktop") {
      const sizes: ViewportSize[] = ["desktop", "tablet", "mobile"];
      const currentIndex = sizes.indexOf(viewportSize);
      if (currentIndex > 0) {
        setViewportSize(sizes[currentIndex - 1]);
      }
    } else if (e.key === "ArrowRight" && viewportSize !== "mobile") {
      const sizes: ViewportSize[] = ["desktop", "tablet", "mobile"];
      const currentIndex = sizes.indexOf(viewportSize);
      if (currentIndex < sizes.length - 1) {
        setViewportSize(sizes[currentIndex + 1]);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-full p-0 gap-0 overflow-hidden"
        onKeyDown={handleKeyDown}
        aria-labelledby="template-preview-title"
        aria-describedby="template-preview-description"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle id="template-preview-title" className="text-2xl">
                {template.name} Template Preview
              </DialogTitle>
              <DialogDescription
                id="template-preview-description"
                className="mt-2"
              >
                {template.description}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="ml-4"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Viewport Controls */}
          <div className="flex items-center gap-2 mt-4" role="toolbar" aria-label="Viewport size controls">
            <Button
              variant={viewportSize === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewportSize("desktop")}
              aria-label="Desktop view"
              aria-pressed={viewportSize === "desktop"}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={viewportSize === "tablet" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewportSize("tablet")}
              aria-label="Tablet view"
              aria-pressed={viewportSize === "tablet"}
            >
              <Tablet className="w-4 h-4 mr-2" />
              Tablet
            </Button>
            <Button
              variant={viewportSize === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewportSize("mobile")}
              aria-label="Mobile view"
              aria-pressed={viewportSize === "mobile"}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </Button>
          </div>
        </DialogHeader>

        {/* Preview Content */}
        <div
          ref={previewContainerRef}
          className="flex-1 overflow-auto bg-muted/30 p-6"
          tabIndex={-1}
          role="region"
          aria-label="Template preview content"
        >
          <div className={cn(getViewportClass(), "transition-all duration-300")}>
            <Card
              className={cn(
                "bg-white shadow-lg overflow-hidden",
                getPreviewScale(),
                "origin-top"
              )}
            >
              {examplePortfolio && (
                <TemplateRenderer
                  portfolio={examplePortfolio}
                  templateConfig={template.config}
                />
              )}
            </Card>
          </div>
        </div>

        {/* Skip link for accessibility */}
        <a
          href="#template-preview-title"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to preview title
        </a>
      </DialogContent>
    </Dialog>
  );
}

