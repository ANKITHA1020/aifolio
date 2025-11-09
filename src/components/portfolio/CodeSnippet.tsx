import { Card } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ComponentErrorBoundary from "./ComponentErrorBoundary";

interface CodeSnippet {
  language?: string;
  code?: string;
  description?: string;
  filename?: string;
}

interface CodeSnippetProps {
  snippet: CodeSnippet | any;
  className?: string;
}

export default function CodeSnippet({ snippet, className = "" }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  // Validate snippet data
  if (!snippet || typeof snippet !== 'object') {
    return (
      <ComponentErrorBoundary componentName="Code Snippet">
        <Card className={`template-developer-card ${className}`}>
          <div className="p-4 text-center text-muted-foreground">
            <p>Invalid code snippet</p>
          </div>
        </Card>
      </ComponentErrorBoundary>
    );
  }

  // Normalize snippet data
  const normalizedSnippet: CodeSnippet = {
    language: snippet.language || 'text',
    code: snippet.code || '',
    description: snippet.description,
    filename: snippet.filename,
  };

  // Validate required fields
  if (!normalizedSnippet.code || normalizedSnippet.code.trim().length === 0) {
    return (
      <ComponentErrorBoundary componentName="Code Snippet">
        <Card className={`template-developer-card ${className}`}>
          <div className="p-4 text-center text-muted-foreground">
            <p>No code content available</p>
          </div>
        </Card>
      </ComponentErrorBoundary>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(normalizedSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <ComponentErrorBoundary componentName="Code Snippet">
      <Card className={`template-developer-card relative ${className} hover:shadow-lg transition-shadow`}>
        {normalizedSnippet.filename && (
          <div className="px-4 py-2 bg-muted border-b border-border text-sm font-mono">
            {normalizedSnippet.filename}
          </div>
        )}
        {normalizedSnippet.description && (
          <div className="px-4 py-2 bg-muted/50 border-b border-border text-sm">
            {normalizedSnippet.description}
          </div>
        )}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 hover:bg-muted/80"
            onClick={handleCopy}
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </>
            )}
          </Button>
          <pre className="p-4 overflow-x-auto text-sm font-mono bg-[#0f172a] text-green-400">
            <code className={`language-${normalizedSnippet.language}`}>
              {normalizedSnippet.code}
            </code>
          </pre>
        </div>
        {normalizedSnippet.language && normalizedSnippet.language !== 'text' && (
          <div className="px-4 py-2 bg-muted border-t border-border text-xs text-muted-foreground">
            {normalizedSnippet.language}
          </div>
        )}
      </Card>
    </ComponentErrorBoundary>
  );
}

