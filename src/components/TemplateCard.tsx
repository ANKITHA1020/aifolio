import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Check, Layers, Sparkles, Users } from "lucide-react";

interface Template {
  id: number;
  name: string;
  type: string;
  description: string;
  preview_image: string | null;
  config: Record<string, any>;
  is_active: boolean;
}

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
  isSelected?: boolean;
  onPreview?: (template: Template) => void;
}

const TemplateCard = ({ template, onSelect, isSelected = false, onPreview }: TemplateCardProps) => {
  const getTemplateTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      classic: "bg-blue-500/10 text-blue-500",
      modern: "bg-purple-500/10 text-purple-500",
      minimalist: "bg-gray-500/10 text-gray-500",
      developer: "bg-green-500/10 text-green-500",
      designer: "bg-pink-500/10 text-pink-500",
    };
    return colors[type] || colors.modern;
  };

  const getTemplateFeatures = (type: string) => {
    const features: Record<string, { bestFor: string[]; highlights: string[] }> = {
      classic: {
        bestFor: ["Business Professionals", "Corporate Roles", "Traditional Industries"],
        highlights: ["Professional Layout", "Clean Design", "Easy Navigation"],
      },
      modern: {
        bestFor: ["Digital Professionals", "Tech Roles", "Creative Industries"],
        highlights: ["Bold Typography", "Modern Aesthetics", "Interactive Elements"],
      },
      minimalist: {
        bestFor: ["Product Managers", "Consultants", "Minimalist Lovers"],
        highlights: ["Clean & Simple", "Focus on Content", "Fast Loading"],
      },
      developer: {
        bestFor: ["Software Developers", "Engineers", "Tech Professionals"],
        highlights: ["Code Showcase", "GitHub Integration", "Technical Focus"],
      },
      designer: {
        bestFor: ["Designers", "Artists", "Creative Professionals"],
        highlights: ["Visual Portfolio", "Image Gallery", "Creative Layout"],
      },
    };
    return features[type] || features.modern;
  };

  const features = getTemplateFeatures(template.type);

  return (
    <Card
      className={`
        relative overflow-hidden transition-all cursor-pointer group
        ${isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"}
      `}
    >
      {/* Preview Image or Placeholder */}
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
        {template.preview_image ? (
          <img
            src={template.preview_image}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">{template.name}</p>
          </div>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{template.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTemplateTypeColor(template.type)}`}>
            {template.type}
          </span>
        </div>
        
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        )}

        {/* Features Section */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">Highlights:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {features.highlights.map((highlight, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-primary/5 text-primary rounded text-xs border border-primary/10"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>

        {/* Best For Section */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium">Best For:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {features.bestFor.map((useCase, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>

        {/* Component Count */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
          <Layers className="w-3.5 h-3.5" />
          <span>11+ Component Types Available</span>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => onSelect(template)}
            aria-label={isSelected ? `Selected ${template.name} template` : `Select ${template.name} template`}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
          {onPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreview(template)}
              aria-label={`Preview ${template.name} template`}
              title={`Preview ${template.name} template`}
              className="gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TemplateCard;

