import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { validateBlogPosts, ValidatedBlogPost } from "@/utils/componentDataValidator";
import { useState } from "react";
import ComponentErrorBoundary from "./ComponentErrorBoundary";

interface BlogProps {
  posts?: ValidatedBlogPost[] | any[];
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
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>');
};

// Truncate text to max length
const truncateText = (text: string, maxLength: number = 200): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export default function TemplateBlog({ posts, templateType, config }: BlogProps) {
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  
  const validatedPosts = validateBlogPosts(posts);
  
  if (!validatedPosts || validatedPosts.length === 0) {
    return (
      <section id="section-blog" className={`template-${templateType}-section`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="template-section-title">Blog</h2>
          <p className="text-muted-foreground text-center py-8">
            No blog posts to display
          </p>
        </div>
      </section>
    );
  }

  const toggleExpand = (postId: number) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const getPostImageUrl = (image: string | null | undefined): string | null => {
    if (!image) return null;
    return getImageUrl(image);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return '';
    }
  };

  const getBlogLayoutClass = () => {
    switch (templateType) {
      case 'minimalist':
        return 'space-y-6';
      case 'developer':
        return 'space-y-4 font-mono';
      case 'designer':
        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
      default:
        return 'space-y-6';
    }
  };

  const getPostCardClass = () => {
    switch (templateType) {
      case 'classic':
        return 'border-2 border-blue-200 hover:border-blue-400';
      case 'modern':
        return 'hover:shadow-xl transition-shadow';
      case 'minimalist':
        return 'border-l-4 border-gray-400';
      case 'developer':
        return 'border border-green-500/20 bg-green-500/5';
      case 'designer':
        return 'border-orange-200 hover:border-orange-400';
      default:
        return '';
    }
  };

  return (
    <ComponentErrorBoundary componentName="Blog">
      <section id="section-blog" className={`template-${templateType}-section`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="template-section-title">Blog</h2>
          
          <div className={getBlogLayoutClass()}>
            {validatedPosts.map((post) => {
              const isExpanded = expandedPosts.has(post.id);
              const imageUrl = getPostImageUrl(post.featured_image);
              const excerpt = post.excerpt || (post.content_markdown ? truncateText(post.content_markdown.replace(/[#*`]/g, ''), 200) : '');
              const contentHtml = post.content_markdown ? markdownToHtml(post.content_markdown) : '';

              return (
                <Card
                  key={post.id}
                  className={`overflow-hidden transition-all ${getPostCardClass()}`}
                >
                  <div className="p-6">
                    {/* Featured Image */}
                    {imageUrl && (
                      <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-muted">
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Post Header */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-2">{post.title}</h3>
                      {post.published_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.published_date)}</span>
                        </div>
                      )}
                    </div>

                    {/* Excerpt/Content Preview */}
                    {excerpt && !isExpanded && (
                      <div className="prose prose-sm max-w-none mb-4">
                        <p className="text-muted-foreground">{excerpt}</p>
                      </div>
                    )}

                    {/* Full Content */}
                    {isExpanded && contentHtml && (
                      <div 
                        className="prose prose-sm max-w-none mb-4"
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                      />
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(post.id)}
                      >
                        {isExpanded ? 'Show Less' : 'Read More'}
                        <ArrowRight className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </Button>
                      
                      {post.published && (
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs">
                          Published
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

