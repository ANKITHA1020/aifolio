import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ResumeFieldCard from "./ResumeFieldCard";
import { getAvailableResumeFields, ResumeData } from "@/utils/resumeFieldMapper";

interface ResumeDataPanelProps {
  resumeData: ResumeData | null;
  onFillComponent?: (componentType: string) => void;
  onFillAll?: () => void;
  className?: string;
}

export default function ResumeDataPanel({
  resumeData,
  onFillComponent,
  onFillAll,
  className,
}: ResumeDataPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    personal: true,
    contact: true,
    skills: true,
    experience: false,
    education: false,
    certifications: false,
  });

  if (!resumeData) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Resume Data</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          No resume data available. Upload and parse a resume to enable resume-based component population.
        </p>
      </Card>
    );
  }

  const availableFields = resumeData ? getAvailableResumeFields(resumeData) : {
    personal: [],
    experience: [],
    education: [],
    skills: [],
    contact: [],
    certifications: [],
  };
  const hasAnyFields = Object.values(availableFields).some(category => category.length > 0);

  if (!hasAnyFields) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Resume Data</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Resume data is empty. Please parse your resume to extract data.
        </p>
      </Card>
    );
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const CategorySection = ({
    title,
    icon: Icon,
    category,
    fields,
  }: {
    title: string;
    icon: any;
    category: string;
    fields: Array<{ name: string; value: any; type: string }>;
  }) => {
    if (fields.length === 0) return null;

    const isExpanded = expandedCategories[category];

    return (
      <div className="space-y-2">
        <button
          onClick={() => toggleCategory(category)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{title}</span>
            <Badge variant="secondary" className="text-xs">
              {fields.length}
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {isExpanded && (
          <div className="space-y-2 pl-6">
            {fields.map((field) => (
              <ResumeFieldCard
                key={field.name}
                fieldName={field.name}
                fieldValue={field.value}
                fieldType={field.type as 'text' | 'array' | 'object'}
                category={category as any}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Resume Data</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {onFillAll && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onFillAll}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Fill All Components
            </Button>
          )}

          <div className="space-y-3">
            <CategorySection
              title="Personal Info"
              icon={FileText}
              category="personal"
              fields={availableFields.personal}
            />
            <CategorySection
              title="Contact"
              icon={Mail}
              category="contact"
              fields={availableFields.contact}
            />
            <CategorySection
              title="Skills"
              icon={Award}
              category="skills"
              fields={availableFields.skills}
            />
            <CategorySection
              title="Experience"
              icon={Briefcase}
              category="experience"
              fields={availableFields.experience}
            />
            <CategorySection
              title="Education"
              icon={GraduationCap}
              category="education"
              fields={availableFields.education}
            />
            <CategorySection
              title="Certifications"
              icon={Award}
              category="certifications"
              fields={availableFields.certifications}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

