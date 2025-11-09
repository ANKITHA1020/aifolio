import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, X, Edit, TrendingUp } from "lucide-react";

interface AISuggestion {
  content: string | Record<string, any>;
  confidence?: number;
  quality?: "high" | "medium" | "low";
  type?: string;
  message?: string;
}

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onAccept: (content: string | Record<string, any>) => void;
  onReject?: () => void;
  onEdit?: (content: string | Record<string, any>) => void;
  showConfidence?: boolean;
  editable?: boolean;
}

export default function AISuggestionCard({
  suggestion,
  onAccept,
  onReject,
  onEdit,
  showConfidence = true,
  editable = true,
}: AISuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case "high":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-muted-foreground";
    if (confidence >= 0.8) return "text-green-500";
    if (confidence >= 0.6) return "text-yellow-500";
    return "text-orange-500";
  };

  const formatContent = (content: string | Record<string, any>) => {
    if (typeof content === "string") {
      return content;
    }
    return JSON.stringify(content, null, 2);
  };

  const displayContent = formatContent(suggestion.content);
  const isLongContent = displayContent.length > 200;

  return (
    <Card className={`p-4 border-2 ${getQualityColor(suggestion.quality)}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">
              {suggestion.type || "AI Suggestion"}
            </span>
            {suggestion.quality && (
              <Badge variant="outline" className={getQualityColor(suggestion.quality)}>
                {suggestion.quality} quality
              </Badge>
            )}
          </div>
          {showConfidence && suggestion.confidence !== undefined && (
            <div className="flex items-center gap-1">
              <TrendingUp className={`w-3 h-3 ${getConfidenceColor(suggestion.confidence)}`} />
              <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                {Math.round(suggestion.confidence * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Message */}
        {suggestion.message && (
          <p className="text-sm text-muted-foreground">{suggestion.message}</p>
        )}

        {/* Content Preview */}
        <div className="space-y-2">
          <div className="relative">
            <div
              className={`text-sm p-3 bg-muted rounded-lg font-mono overflow-hidden ${
                isExpanded ? "max-h-none" : "max-h-32"
              }`}
            >
              {isLongContent && !isExpanded ? (
                <>
                  {displayContent.substring(0, 200)}
                  <span className="text-muted-foreground">...</span>
                </>
              ) : (
                displayContent
              )}
            </div>
            {isLongContent && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show Less" : "Show More"}
              </Button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={() => onAccept(suggestion.content)}
            size="sm"
            className="flex-1 gap-2"
            variant="default"
          >
            <Check className="w-4 h-4" />
            Accept
          </Button>
          {editable && onEdit && (
            <Button
              onClick={() => onEdit(suggestion.content)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          )}
          {onReject && (
            <Button
              onClick={onReject}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Reject
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

