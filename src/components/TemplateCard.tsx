import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Check } from "lucide-react";

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
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{template.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTemplateTypeColor(template.type)}`}>
            {template.type}
          </span>
        </div>
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        )}
        
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
            >
              <Eye className="w-4 h-4" />
              <span className="sr-only">Preview</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TemplateCard;

