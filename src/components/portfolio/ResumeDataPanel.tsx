import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ResumeFieldCard from "./ResumeFieldCard";
import { getAvailableResumeFields, ResumeData } from "@/utils/resumeFieldMapper";

interface ResumeDataPanelProps {
  resumeData: ResumeData | null;
  availableResumes?: Array<{id: number; file: string; uploaded_at: string; status: string}>;
  selectedResumeId?: number | null;
  loadingResumes?: boolean;
  loadingResumeData?: boolean;
  onResumeSelect?: (resumeId: number | null) => void;
  onRefresh?: () => void;
  onFillComponent?: (componentType: string) => void;
  onFillAll?: () => void;
  className?: string;
}

export default function ResumeDataPanel({
  resumeData,
  availableResumes = [],
  selectedResumeId,
  loadingResumes = false,
  loadingResumeData = false,
  onResumeSelect,
  onRefresh,
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
      <Card className={cn("p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2", className)}>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b">
          <div className="p-2 rounded-lg bg-primary/20">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-base">Resume Data</h3>
        </div>
        <p className="text-sm text-muted-foreground">
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
      <Card className={cn("p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2", className)}>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b">
          <div className="p-2 rounded-lg bg-primary/20">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-base">Resume Data</h3>
        </div>
        <p className="text-sm text-muted-foreground">
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
    <Card className={cn("p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2", className)}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-base">Resume Data</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
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
          {/* Resume Selection */}
          {availableResumes.length > 0 && onResumeSelect && (
            <div className="space-y-2 pb-3 border-b">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">Select Resume</Label>
                {onRefresh && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onRefresh}
                    disabled={loadingResumes || loadingResumeData}
                    title="Refresh resume list"
                  >
                    {loadingResumes || loadingResumeData ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
              <Select
                value={selectedResumeId?.toString() || ""}
                onValueChange={(value) => {
                  onResumeSelect(value ? parseInt(value) : null);
                }}
                disabled={loadingResumes || loadingResumeData}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select a resume" />
                </SelectTrigger>
                <SelectContent>
                  {availableResumes.map((resume) => {
                    const filename = resume.file.split('/').pop() || 'Resume';
                    const uploadDate = new Date(resume.uploaded_at).toLocaleDateString();
                    const isSelected = resume.id === selectedResumeId;
                    return (
                      <SelectItem key={resume.id} value={resume.id.toString()}>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            <span className="font-medium truncate">{filename}</span>
                            {isSelected && (
                              <Badge variant="secondary" className="ml-auto text-xs">Selected</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground ml-5">{uploadDate}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {loadingResumeData && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Loading resume data...</span>
                </div>
              )}
            </div>
          )}

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

