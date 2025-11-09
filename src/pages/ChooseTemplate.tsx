import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Grid3x3, List, Check, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { templateApi } from "@/lib/api";
import TemplateCard from "@/components/TemplateCard";
import TemplatePreview from "@/components/TemplatePreview";
import { Input } from "@/components/ui/input";

interface Template {
  id: number;
  name: string;
  type: string;
  description: string;
  preview_image: string | null;
  config: Record<string, any>;
  is_active: boolean;
}

const ChooseTemplate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateApi.getTemplates();
      // Handle paginated response (DRF returns { results: [...] }) or direct array
      const templatesArray = Array.isArray(data) 
        ? data 
        : (data?.results || []);
      setTemplates(templatesArray);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load templates",
        variant: "destructive",
      });
      setTemplates([]); // Ensure it's always an array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    toast({
      title: "Template selected",
      description: `You selected the ${template.name} template`,
    });
  };

  const handleContinue = () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a template to continue",
        variant: "destructive",
      });
      return;
    }

    navigate("/portfolio-builder", {
      state: { selectedTemplate },
    });
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  // Safety check: ensure templates is always an array before using .map()
  const templatesArray = Array.isArray(templates) ? templates : [];
  const uniqueTypes = Array.from(new Set(templatesArray.map((t) => t.type)));
  
  // Filter by type and search query
  const filteredTemplates = templatesArray.filter((t) => {
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesSearch =
      searchQuery === "" ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Choose Template</h1>
          <p className="text-muted-foreground">
            Select a template that best represents your style and brand
          </p>
        </div>

        {/* Filters and View Controls */}
        <Card className="p-4 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Type Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                {uniqueTypes.map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Templates Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No templates found</p>
          </Card>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleSelectTemplate}
                  onPreview={handlePreview}
                  isSelected={selectedTemplate?.id === template.id}
                />
              ))}
            </div>

            {/* Continue Button */}
            {selectedTemplate && (
              <Card className="p-6 mt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Selected Template</p>
                    <p className="text-lg font-semibold">{selectedTemplate.name}</p>
                  </div>
                  <Button onClick={handleContinue} size="lg">
                    Continue with {selectedTemplate.name}
                    <Check className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Template Preview Modal */}
      <TemplatePreview
        template={previewTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
};

export default ChooseTemplate;

