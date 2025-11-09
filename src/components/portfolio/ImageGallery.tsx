import { Card } from "@/components/ui/card";
import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { getImageUrl } from "@/utils/imageUtils";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

interface ImageItem {
  url: string;
  alt?: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: ImageItem[] | any[];
  layout?: "grid" | "masonry";
  className?: string;
}

export default function ImageGallery({ images, layout = "grid", className = "" }: ImageGalleryProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Validate and filter images
  if (!Array.isArray(images) || images.length === 0) {
    return (
      <ComponentErrorBoundary componentName="Image Gallery">
        <div className="text-center py-8 text-muted-foreground">
          <p>No images to display</p>
        </div>
      </ComponentErrorBoundary>
    );
  }

  // Filter out invalid images and normalize structure
  const validImages = images
    .map((img, idx) => {
      if (!img) return null;
      // Handle both {url, alt, caption} and direct url string
      if (typeof img === 'string') {
        return { url: img, alt: `Image ${idx + 1}`, caption: undefined };
      }
      if (typeof img === 'object' && img.url && typeof img.url === "string") {
        return {
          url: img.url,
          alt: img.alt || `Image ${idx + 1}`,
          caption: img.caption,
        };
      }
      return null;
    })
    .filter((img): img is ImageItem => img !== null);
  
  if (validImages.length === 0) {
    return (
      <ComponentErrorBoundary componentName="Image Gallery">
        <div className="text-center py-8 text-muted-foreground">
          <p>No valid images to display</p>
        </div>
      </ComponentErrorBoundary>
    );
  }

  const handleImageError = (idx: number) => {
    setImageErrors(prev => new Set(prev).add(idx));
  };

  if (layout === "masonry") {
    return (
      <ComponentErrorBoundary componentName="Image Gallery">
        <div className={`columns-1 md:columns-2 lg:columns-3 gap-4 ${className}`}>
          {validImages.map((image, idx) => {
            const imageUrl = getImageUrl(image.url);
            const hasError = imageErrors.has(idx);

            return (
              <Card
                key={idx}
                className="template-designer-card mb-4 break-inside-avoid overflow-hidden"
              >
                {imageUrl && !hasError ? (
                  <div className="overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={image.alt || `Image ${idx + 1}`}
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={() => handleImageError(idx)}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
                {image.caption && (
                  <div className="p-3 text-sm text-muted-foreground">
                    {image.caption}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="Image Gallery">
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {validImages.map((image, idx) => {
          const imageUrl = getImageUrl(image.url);
          const hasError = imageErrors.has(idx);

          return (
            <Card
              key={idx}
              className="template-designer-card overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {imageUrl && !hasError ? (
                  <img
                    src={imageUrl}
                    alt={image.alt || `Image ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={() => handleImageError(idx)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              {image.caption && (
                <div className="p-3 text-sm text-muted-foreground">
                  {image.caption}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </ComponentErrorBoundary>
  );
}

