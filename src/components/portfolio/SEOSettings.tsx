import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { portfolioApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SEOSettingsProps {
  portfolioId: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  metaKeywords?: string;
  metaDescription?: string;
  onUpdate: (data: {
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    meta_keywords?: string;
    meta_description?: string;
  }) => Promise<void>;
  className?: string;
}

export default function SEOSettings({
  portfolioId,
  seoTitle,
  seoDescription,
  seoKeywords,
  metaKeywords,
  metaDescription,
  onUpdate,
  className,
}: SEOSettingsProps) {
  const [title, setTitle] = useState(seoTitle || "");
  const [description, setDescription] = useState(seoDescription || metaDescription || "");
  const [keywords, setKeywords] = useState(seoKeywords || metaKeywords || "");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleGenerateKeywords = async () => {
    try {
      setGenerating(true);
      const data = await portfolioApi.generateKeywords(portfolioId);
      setKeywords(data.keywords_string);
      toast({
        title: "Success",
        description: "Keywords generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate keywords",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleOptimizeSEO = async () => {
    try {
      setGenerating(true);
      const result = await portfolioApi.optimizeSEO(portfolioId);
      
      if (result.optimized.meta_description) {
        setDescription(result.optimized.meta_description);
      }
      if (result.optimized.meta_keywords) {
        setKeywords(result.optimized.meta_keywords);
      }

      toast({
        title: "Success",
        description: `SEO optimized. Score: ${result.analysis.score}/100`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to optimize SEO",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate({
        seo_title: title,
        seo_description: description,
        seo_keywords: keywords,
        meta_keywords: keywords,
        meta_description: description,
      });
      toast({
        title: "Success",
        description: "SEO settings saved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save SEO settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const titleLength = title.length;
  const descriptionLength = description.length;
  const keywordsCount = keywords.split(",").filter((k) => k.trim()).length;

  return (
    <Card className={cn("p-6 space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">SEO Settings</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOptimizeSEO}
          disabled={generating}
          className="gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Optimize with AI
            </>
          )}
        </Button>
      </div>

      {/* SEO Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="seo-title">SEO Title</Label>
          <span className={cn(
            "text-xs",
            titleLength < 30 ? "text-yellow-600" : titleLength > 60 ? "text-red-600" : "text-green-600"
          )}>
            {titleLength}/60
          </span>
        </div>
        <Input
          id="seo-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., John Doe - Full Stack Developer Portfolio"
          maxLength={60}
        />
        <p className="text-xs text-muted-foreground">
          Recommended: 30-60 characters. Include your name and profession.
        </p>
      </div>

      {/* Meta Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="meta-description">Meta Description</Label>
          <span className={cn(
            "text-xs",
            descriptionLength < 120 ? "text-yellow-600" : descriptionLength > 160 ? "text-red-600" : "text-green-600"
          )}>
            {descriptionLength}/160
          </span>
        </div>
        <Textarea
          id="meta-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A compelling description of your portfolio and expertise..."
          rows={3}
          maxLength={160}
        />
        <p className="text-xs text-muted-foreground">
          Recommended: 120-160 characters. Summarize your portfolio and key skills.
        </p>
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="keywords">Keywords</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {keywordsCount} keywords
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateKeywords}
              disabled={generating}
              className="h-6 px-2 gap-1"
            >
              {generating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
        <Input
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g., web developer, React, Node.js, portfolio"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated keywords relevant to your portfolio. Use AI to generate suggestions.
        </p>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Save SEO Settings
          </>
        )}
      </Button>
    </Card>
  );
}

