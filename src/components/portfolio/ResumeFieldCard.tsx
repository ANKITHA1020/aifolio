import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, FileText, Briefcase, GraduationCap, Award, Mail, Phone, MapPin, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ResumeFieldCardProps {
  fieldName: string;
  fieldValue: any;
  fieldType?: 'text' | 'array' | 'object';
  category?: 'personal' | 'experience' | 'education' | 'skills' | 'contact' | 'certifications';
  onUse?: () => void;
  isMapped?: boolean;
  className?: string;
}

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'personal':
      return FileText;
    case 'experience':
      return Briefcase;
    case 'education':
      return GraduationCap;
    case 'skills':
      return Award;
    case 'contact':
      return Mail;
    case 'certifications':
      return Award;
    default:
      return FileText;
  }
};

const formatFieldValue = (value: any, type?: string): string => {
  if (value === null || value === undefined) return '';
  
  if (type === 'array' || Array.isArray(value)) {
    if (Array.isArray(value) && value.length > 0) {
      if (typeof value[0] === 'object') {
        return `${value.length} items`;
      }
      return value.slice(0, 3).join(', ') + (value.length > 3 ? ` (+${value.length - 3} more)` : '');
    }
    return 'Empty array';
  }
  
  if (type === 'object' || (typeof value === 'object' && !Array.isArray(value))) {
    return Object.keys(value).length > 0 ? `${Object.keys(value).length} fields` : 'Empty object';
  }
  
  return String(value);
};

export default function ResumeFieldCard({
  fieldName,
  fieldValue,
  fieldType,
  category,
  onUse,
  isMapped = false,
  className,
}: ResumeFieldCardProps) {
  const [copied, setCopied] = useState(false);
  const Icon = getCategoryIcon(category);

  const handleCopy = () => {
    const textToCopy = typeof fieldValue === 'string' 
      ? fieldValue 
      : JSON.stringify(fieldValue, null, 2);
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayValue = formatFieldValue(fieldValue, fieldType);

  return (
    <Card
      className={cn(
        "p-3 transition-all",
        isMapped && "border-primary bg-primary/5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium capitalize">
              {fieldName.replace(/_/g, ' ')}
            </span>
            {isMapped && (
              <Badge variant="secondary" className="text-xs">
                Mapped
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {displayValue || 'No value'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
          {onUse && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUse}
              className="h-7 text-xs"
            >
              Use
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

