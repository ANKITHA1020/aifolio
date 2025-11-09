import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIContentGeneratorProps {
  onGenerate: (prompt: string, context?: Record<string, any>) => Promise<string>;
  onAccept: (content: string) => void;
  onReject?: () => void;
  label?: string;
  placeholder?: string;
  context?: Record<string, any>;
  disabled?: boolean;
  contentType?: "bio" | "project" | "blog" | "other";
}

export default function AIContentGenerator({
  onGenerate,
  onAccept,
  onReject,
  label = "AI Content Generation",
  placeholder = "Enter a topic or prompt...",
  context,
  disabled = false,
  contentType = "other",
}: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      const content = await onGenerate(prompt, context);
      setGeneratedContent(content);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate content";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedContent) {
      onAccept(generatedContent);
      setGeneratedContent(null);
      setPrompt("");
      toast({
        title: "Success",
        description: "Content applied successfully",
      });
    }
  };

  const handleReject = () => {
    setGeneratedContent(null);
    setPrompt("");
    if (onReject) {
      onReject();
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{label}</h3>
      </div>

      {!generatedContent ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor="ai-prompt">Prompt</Label>
            <Textarea
              id="ai-prompt"
              placeholder={placeholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={generating || disabled}
              className="mt-1"
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={generating || disabled || !prompt.trim()}
            className="w-full gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label>Generated Content</Label>
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="mt-1 font-mono text-sm"
              rows={10}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAccept} className="flex-1 gap-2" variant="default">
              <Check className="w-4 h-4" />
              Accept
            </Button>
            <Button onClick={handleReject} className="flex-1 gap-2" variant="outline">
              <X className="w-4 h-4" />
              Reject
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

