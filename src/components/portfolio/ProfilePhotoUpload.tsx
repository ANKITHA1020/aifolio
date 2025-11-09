import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  userPhotoUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  className?: string;
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  userPhotoUrl,
  onUpload,
  onRemove,
  className,
}: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploading(true);
      await onUpload(file);
      toast({
        title: "Success",
        description: "Profile photo uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
      setPreview(currentPhotoUrl || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    
    try {
      setRemoving(true);
      await onRemove();
      setPreview(null);
      toast({
        title: "Success",
        description: "Profile photo removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove photo",
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
    }
  };

  const displayPhoto = preview || currentPhotoUrl || userPhotoUrl;

  return (
    <Card className={cn("p-6", className)}>
      <Label className="text-lg font-semibold mb-4 block">Profile Photo</Label>
      
      <div className="flex items-start gap-6">
        {/* Photo Preview */}
        <div className="relative">
          {displayPhoto ? (
            <div className="relative">
              <img
                src={displayPhoto}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-border shadow-lg"
              />
              {preview && preview !== currentPhotoUrl && (
                <div className="absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs text-primary font-medium">New</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload a profile photo to personalize your portfolio. Recommended size: 400x400px.
            </p>
            
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="profile-photo-upload"
                disabled={uploading || removing}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || removing}
                className="gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {displayPhoto ? "Change Photo" : "Upload Photo"}
                  </>
                )}
              </Button>

              {displayPhoto && onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRemove}
                  disabled={uploading || removing}
                  className="gap-2"
                >
                  {removing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Remove
                    </>
                  )}
                </Button>
              )}
            </div>

            {userPhotoUrl && !currentPhotoUrl && (
              <p className="text-xs text-muted-foreground">
                Currently showing your user profile photo. Upload a portfolio-specific photo to override.
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

