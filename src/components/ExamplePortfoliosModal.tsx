import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Home } from "lucide-react";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import {
  getClassicExampleData,
  getModernExampleData,
  getMinimalistExampleData,
  getDeveloperExampleData,
  getDesignerExampleData,
} from "@/utils/templateExampleData";

interface ExamplePortfolio {
  title: string;
  template_type: string;
  description: string;
  exampleData: any;
  config: Record<string, any>;
}

const examplePortfolios: ExamplePortfolio[] = [
  {
    title: "Classic Portfolio",
    template_type: "classic",
    description: "Professional, traditional design perfect for corporate roles",
    exampleData: getClassicExampleData(),
    config: {
      primary_color: "#2563eb",
      secondary_color: "#64748b",
      font_family: "Georgia, serif",
    },
  },
  {
    title: "Modern Portfolio",
    template_type: "modern",
    description: "Contemporary design with bold typography and clean aesthetics",
    exampleData: getModernExampleData(),
    config: {
      primary_color: "#7c3aed",
      secondary_color: "#a78bfa",
      font_family: "Inter, sans-serif",
    },
  },
  {
    title: "Minimalist Portfolio",
    template_type: "minimalist",
    description: "Simple and elegant design with focus on content",
    exampleData: getMinimalistExampleData(),
    config: {
      primary_color: "#000000",
      secondary_color: "#6b7280",
      font_family: "Helvetica, sans-serif",
    },
  },
  {
    title: "Developer Portfolio",
    template_type: "developer",
    description: "Designed for software developers and engineers",
    exampleData: getDeveloperExampleData(),
    config: {
      primary_color: "#10b981",
      secondary_color: "#6ee7b7",
      font_family: "Monaco, monospace",
    },
  },
  {
    title: "Designer Portfolio",
    template_type: "designer",
    description: "Perfect for designers and creatives with stunning visuals",
    exampleData: getDesignerExampleData(),
    config: {
      primary_color: "#f59e0b",
      secondary_color: "#fbbf24",
      font_family: "Poppins, sans-serif",
    },
  },
];

interface ExamplePortfoliosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExamplePortfoliosModal({
  open,
  onOpenChange,
}: ExamplePortfoliosModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold">
                Portfolio Examples
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                Explore our collection of stunning portfolio templates with full content examples.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  navigate("/");
                }}
                className="gap-2"
                aria-label="Back to home"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="ml-2"
                aria-label="Close examples"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-12 max-w-7xl mx-auto">
            {examplePortfolios.map((portfolio, index) => (
              <div key={index} className="space-y-4">
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 border-b border-border/50 -mt-6 -mx-6 px-6">
                  <h2 className="text-2xl font-bold mb-1">{portfolio.title}</h2>
                  <p className="text-muted-foreground">{portfolio.description}</p>
                </div>
                <Card className="bg-white shadow-lg overflow-hidden">
                  <TemplateRenderer
                    portfolio={{
                      ...portfolio.exampleData,
                      id: undefined,
                      template: null,
                      custom_settings: portfolio.config,
                      profile_photo_url: null,
                      user_profile_photo_url: null,
                    }}
                    templateConfig={portfolio.config}
                  />
                </Card>
                {index < examplePortfolios.length - 1 && (
                  <div className="h-px bg-border/30 my-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

