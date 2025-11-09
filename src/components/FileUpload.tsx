import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUploadProgress?: (progress: number) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  disabled?: boolean;
}

const FileUpload = ({
  onFileSelect,
  onUploadProgress,
  acceptedTypes = [".pdf", ".doc", ".docx"],
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file type
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: `Please upload a file with one of these extensions: ${acceptedTypes.join(", ")}`,
          variant: "destructive",
        });
        return false;
      }

      // Check file size
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    },
    [acceptedTypes, maxSize, toast]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setSelectedFile(file);
        setUploadProgress(0);
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleBrowseClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {!selectedFile ? (
        <Card
          className={`
            relative border-2 border-dashed transition-all cursor-pointer
            ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  Drag and drop your file here
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: {acceptedTypes.join(", ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default FileUpload;

