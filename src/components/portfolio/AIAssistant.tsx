import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Lightbulb, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { portfolioApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Suggestion {
  type: string;
  component?: string;
  priority: string;
  message: string;
  action: string;
}

interface AIAssistantProps {
  portfolioId: number;
  onSuggestionAction?: (action: string, suggestion: Suggestion) => void;
  className?: string;
}

export default function AIAssistant({ portfolioId, onSuggestionAction, className }: AIAssistantProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [metaDescription, setMetaDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (portfolioId) {
      loadSuggestions();
    }
  }, [portfolioId]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await portfolioApi.getSuggestions(portfolioId);
      setSuggestions(data.suggestions || []);
      setKeywords(data.keywords || []);
      setMetaDescription(data.meta_description);
    } catch (error: any) {
      console.error("Failed to load suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to load AI suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionAction = (suggestion: Suggestion) => {
    if (onSuggestionAction) {
      onSuggestionAction(suggestion.action, suggestion);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      case "medium":
        return <TrendingUp className="w-4 h-4" />;
      case "low":
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  if (!portfolioId) return null;

  return (
    <Card className={cn("p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2", className)}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-base">AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="gap-2"
        >
          {expanded ? "Collapse" : "Expand"}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Suggestions */}
              {suggestions.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Suggestions</h4>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg border flex items-start gap-3",
                        getPriorityColor(suggestion.priority)
                      )}
                    >
                      <div className="mt-0.5">
                        {getPriorityIcon(suggestion.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{suggestion.message}</p>
                        {suggestion.component && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {suggestion.component}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuggestionAction(suggestion)}
                        className="shrink-0"
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>No suggestions at this time. Your portfolio looks good!</p>
                </div>
              )}

              {/* Keywords */}
              {keywords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Suggested Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {keywords.slice(0, 10).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta Description */}
              {metaDescription && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Suggested Meta Description</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {metaDescription}
                  </p>
                </div>
              )}

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={loadSuggestions}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Refresh Suggestions
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

