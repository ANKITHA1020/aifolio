import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { getImageUrl } from "@/utils/imageUtils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  templateType: string;
  config?: Record<string, any>;
  profilePhotoUrl?: string | null;
  userProfilePhotoUrl?: string | null;
}

export default function TemplateHeader({ 
  title, 
  subtitle, 
  templateType, 
  config,
  profilePhotoUrl,
  userProfilePhotoUrl,
}: HeaderProps) {
  const [imageError, setImageError] = useState(false);

  // Validate title
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return (
      <ComponentErrorBoundary componentName="Header">
        <header id="section-header" className="template-modern-header">
          <div className="max-w-4xl mx-auto text-center py-8">
            <p className="text-muted-foreground">No title available</p>
          </div>
        </header>
      </ComponentErrorBoundary>
    );
  }

  const classes = {
    classic: "template-classic-header",
    modern: "template-modern-header",
    minimalist: "template-minimalist-header",
    developer: "template-developer-header",
    designer: "template-designer-header",
  };

  const headerClass = classes[templateType as keyof typeof classes] || classes.modern;
  const displayPhoto = (profilePhotoUrl || userProfilePhotoUrl) && !imageError;
  const photoUrl = displayPhoto ? getImageUrl(profilePhotoUrl || userProfilePhotoUrl || '') : null;

  const handleImageError = () => {
    setImageError(true);
  };

  // Photo size based on template type
  const photoSizeClass = {
    classic: "w-32 h-32 md:w-40 md:h-40",
    modern: "w-28 h-28 md:w-36 md:h-36",
    minimalist: "w-24 h-24 md:w-32 md:h-32",
    developer: "w-32 h-32 md:w-40 md:h-40",
    designer: "w-36 h-36 md:w-44 md:h-44",
  };

  const photoSize = photoSizeClass[templateType as keyof typeof photoSizeClass] || photoSizeClass.modern;

  return (
    <ComponentErrorBoundary componentName="Header">
      <header id="section-header" className={headerClass}>
        <div className="max-w-4xl mx-auto">
          {/* Profile Photo */}
          {photoUrl && displayPhoto ? (
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={photoUrl}
                  alt="Profile"
                  className={cn(
                    "rounded-full object-cover border-4 shadow-lg",
                    photoSize,
                    templateType === "minimalist" && "border-gray-200",
                    templateType === "developer" && "border-green-200",
                    templateType === "designer" && "border-orange-200",
                    templateType === "classic" && "border-blue-200",
                    templateType === "modern" && "border-purple-200"
                  )}
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
            </div>
          ) : !imageError && (profilePhotoUrl || userProfilePhotoUrl) ? (
            <div className="flex justify-center mb-6">
              <div className={cn(
                "rounded-full border-4 shadow-lg flex items-center justify-center bg-muted",
                photoSize,
                templateType === "minimalist" && "border-gray-200",
                templateType === "developer" && "border-green-200",
                templateType === "designer" && "border-orange-200",
                templateType === "classic" && "border-blue-200",
                templateType === "modern" && "border-purple-200"
              )}>
                <User className={cn(
                  "text-muted-foreground",
                  templateType === "minimalist" ? "w-12 h-12 md:w-16 md:h-16" :
                  templateType === "developer" ? "w-16 h-16 md:w-20 md:h-20" :
                  "w-14 h-14 md:w-18 md:h-18"
                )} />
              </div>
            </div>
          ) : null}

          {/* Title and Subtitle */}
          <div className={cn("text-center", photoUrl && displayPhoto && "mt-4")}>
            <h1
              className={cn(
                "mb-4",
                templateType === "minimalist"
                  ? "text-5xl font-light tracking-tight"
                  : templateType === "developer"
                  ? "text-4xl font-mono"
                  : "text-5xl md:text-6xl font-bold"
              )}
            >
              {title}
            </h1>
            {subtitle && typeof subtitle === "string" && subtitle.trim().length > 0 && (
              <p
                className={cn(
                  templateType === "minimalist"
                    ? "text-xl font-light"
                    : templateType === "developer"
                    ? "text-lg font-mono opacity-80"
                    : "text-xl md:text-2xl opacity-90"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </header>
    </ComponentErrorBoundary>
  );
}

