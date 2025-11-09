/**
 * Utility functions for handling image URLs and loading
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Get full image URL from relative or absolute path
 */
export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  
  // If already absolute URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Ensure path starts with /
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  
  // Construct full URL
  return `${API_URL}${path}`;
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get image with fallback
 */
export function getImageWithFallback(
  imagePath: string | null | undefined,
  fallback?: string
): string {
  const url = getImageUrl(imagePath);
  if (url) return url;
  return fallback || "/placeholder-image.png";
}

