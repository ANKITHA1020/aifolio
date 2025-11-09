import { useState } from "react";
import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AboutProps {
  bio: string;
  templateType: string;
  config?: Record<string, any>;
}

// Simple markdown to HTML converter (basic)
const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1 py-0.5 rounded">$1</code>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>');
};

const MAX_BIO_LENGTH = 500; // Characters before showing "Read More"

export default function TemplateAbout({ bio, templateType, config }: AboutProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Validate bio
  if (!bio || typeof bio !== "string" || bio.trim().length === 0) {
    return (
      <ComponentErrorBoundary componentName="About">
        <section id="section-about" className="template-modern-section">
          <div className="max-w-4xl mx-auto">
            <h2 className="template-section-title">About</h2>
            <p className="text-muted-foreground text-center py-8">
              No bio available. Add your bio to tell visitors about yourself.
            </p>
          </div>
        </section>
      </ComponentErrorBoundary>
    );
  }

  const classes = {
    classic: "template-classic-section",
    modern: "template-modern-section",
    minimalist: "template-minimalist-section",
    developer: "template-developer-section",
    designer: "template-designer-section",
  };

  const sectionClass = classes[templateType as keyof typeof classes] || classes.modern;
  const shouldTruncate = bio.length > MAX_BIO_LENGTH;
  const displayBio = shouldTruncate && !isExpanded 
    ? bio.substring(0, MAX_BIO_LENGTH).trim() + '...' 
    : bio;
  
  const bioHtml = markdownToHtml(displayBio);
  const hasMarkdown = bio.includes('**') || bio.includes('*') || bio.includes('[') || bio.includes('#') || bio.includes('`');

  return (
    <ComponentErrorBoundary componentName="About">
      <section id="section-about" className={sectionClass}>
        <div className="max-w-4xl mx-auto">
          <h2 className="template-section-title">About</h2>
          <div
            className={`prose prose-lg max-w-none ${
              templateType === "minimalist"
                ? "prose-neutral"
                : templateType === "developer"
                ? "prose-invert font-mono"
                : "prose-invert"
            }`}
          >
            {hasMarkdown ? (
              <div 
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: bioHtml }}
              />
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed">{displayBio}</p>
            )}
          </div>
          {shouldTruncate && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary hover:text-primary/80"
              >
                {isExpanded ? (
                  <>
                    Show Less
                    <ChevronUp className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Read More
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

