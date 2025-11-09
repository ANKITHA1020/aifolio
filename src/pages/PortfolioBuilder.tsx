import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  Loader2,
  GripVertical,
  EyeOff,
  Sparkles,
  Check,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { portfolioApi, authApi, api, projectApi, blogApi } from "@/lib/api";
import ProfilePhotoUpload from "@/components/portfolio/ProfilePhotoUpload";
import AIAssistant from "@/components/portfolio/AIAssistant";
import SEOSettings from "@/components/portfolio/SEOSettings";
import ResumeDataPanel from "@/components/portfolio/ResumeDataPanel";
import {
  getDefaultFieldMappings,
  previewFieldMapping,
  applyFieldMapping,
  convertExperienceToProjects,
  FieldMapping,
  ResumeData,
} from "@/utils/resumeFieldMapper";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COMPONENT_TYPES = [
  { value: "header", label: "Header" },
  { value: "about", label: "About" },
  { value: "skills", label: "Skills" },
  { value: "projects", label: "Projects" },
  { value: "blog", label: "Blog" },
  { value: "contact", label: "Contact" },
];

interface Component {
  id?: number;
  component_type: string;
  order: number;
  is_visible: boolean;
  content: Record<string, any>;
}

interface Portfolio {
  id?: number;
  title: string;
  template?: number;
  template_type: string;
  custom_settings: Record<string, any>;
  components: Component[];
  profile_photo?: string | null;
  profile_photo_url?: string | null;
  user_profile_photo_url?: string | null;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  meta_keywords?: string;
  meta_description?: string;
}

const PortfolioBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [portfolio, setPortfolio] = useState<Portfolio>({
    title: "",
    template_type: "modern",
    custom_settings: {},
    components: [],
    profile_photo: null,
    profile_photo_url: null,
    user_profile_photo_url: null,
  });
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string, any> | null>(null);
  const [loadingResumeData, setLoadingResumeData] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check authentication
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          if (isMounted) {
            api.clearTokens();
            setLoading(false);
            navigate("/auth", { replace: true });
          }
          return;
        }

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000);
        });
        
        const userDataPromise = authApi.getCurrentUser();
        const userData = await Promise.race([userDataPromise, timeoutPromise]) as any;
        
        if (!isMounted) return;
        
        if (userData && (userData.user || userData.id || userData.email)) {
          setIsAuthenticated(true);
          setLoading(false);
        } else {
          throw new Error('Invalid user data received');
        }
      } catch (error: any) {
        console.error('Auth error:', error);
        if (!isMounted) return;
        
        api.clearTokens();
        setLoading(false);
        navigate("/auth", { replace: true });
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (location.state?.selectedTemplate) {
      setSelectedTemplate(location.state.selectedTemplate);
      setPortfolio((prev) => ({
        ...prev,
        template: location.state.selectedTemplate.id,
        template_type: location.state.selectedTemplate.type,
      }));
    }

    // Load existing portfolio if editing
    const portfolioId = new URLSearchParams(location.search).get("id");
    if (portfolioId) {
      loadPortfolio(parseInt(portfolioId));
    }

    // Load resume data
    loadResumeData();
  }, [location, isAuthenticated]);

  const loadResumeData = async () => {
    try {
      setLoadingResumeData(true);
      const data = await portfolioApi.getResumeData();
      if (data.has_resume && data.structured_data) {
        setResumeData(data.structured_data);
      } else {
        setResumeData(null);
      }
    } catch (error) {
      console.error('Failed to load resume data:', error);
      setResumeData(null);
    } finally {
      setLoadingResumeData(false);
    }
  };

  const loadPortfolio = async (id: number) => {
    try {
      const data = await portfolioApi.getPortfolio(id);
      setPortfolio({
        id: data.id,
        title: data.title,
        template: data.template,
        template_type: data.template_type,
        custom_settings: data.custom_settings,
        components: data.components || [],
        profile_photo: data.profile_photo,
        profile_photo_url: data.profile_photo_url,
        user_profile_photo_url: data.user_profile_photo_url,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        seo_keywords: data.seo_keywords,
        meta_keywords: data.meta_keywords,
        meta_description: data.meta_description,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load portfolio",
        variant: "destructive",
      });
    }
  };

  const handleAddComponent = async (type: string) => {
    // Ensure portfolio is saved first
    if (!portfolio.id) {
      if (!portfolio.title.trim()) {
        toast({
          title: "Error",
          description: "Please enter a portfolio title and save before adding components",
          variant: "destructive",
        });
        return;
      }
      
      // Auto-save portfolio first
      try {
        setSaving(true);
        const created = await portfolioApi.createPortfolio({
          title: portfolio.title,
          template: portfolio.template,
          template_type: portfolio.template_type || "modern",
          custom_settings: portfolio.custom_settings,
        });
        
        setPortfolio((prev) => ({
          ...prev,
          id: created.id,
        }));
        
        toast({
          title: "Success",
          description: "Portfolio saved. You can now add components.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to save portfolio. Please save manually first.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      } finally {
        setSaving(false);
      }
    }
    
    const newComponent: Component = {
      component_type: type,
      order: portfolio.components.length,
      is_visible: true,
      content: getDefaultContent(type),
    };
    
    // Save component to backend
    try {
      const created = await portfolioApi.createComponent(portfolio.id!, {
        component_type: newComponent.component_type,
        order: newComponent.order,
        is_visible: newComponent.is_visible,
        content: newComponent.content,
      });
      newComponent.id = created.id;
    } catch (error: any) {
      console.error('Error creating component:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create component",
        variant: "destructive",
      });
      return;
    }
    
    setPortfolio((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));
    setEditingComponent(newComponent);
  };

  const getDefaultContent = (type: string): Record<string, any> => {
    const defaults: Record<string, Record<string, any>> = {
      header: { title: "", subtitle: "", image: "" },
      about: { bio: "", image: "" },
      skills: { skills: [] },
      projects: { projects: [] },
      blog: { posts: [] },
      contact: { email: "", phone: "", social: {} },
    };
    return defaults[type] || {};
  };

  const handleUpdateComponent = async (updatedComponent: Component) => {
    if (!portfolio.id) {
      toast({
        title: "Error",
        description: "Please save the portfolio first",
        variant: "destructive",
      });
      return;
    }
    
    // Save component to backend first
    try {
      if (updatedComponent.id) {
        // Update existing component
        await portfolioApi.updateComponent(
          portfolio.id,
          updatedComponent.id,
          {
            component_type: updatedComponent.component_type,
            order: updatedComponent.order,
            is_visible: updatedComponent.is_visible,
            content: updatedComponent.content,
          }
        );
      } else {
        // Create new component if it doesn't have an ID
        const created = await portfolioApi.createComponent(portfolio.id, {
          component_type: updatedComponent.component_type,
          order: updatedComponent.order,
          is_visible: updatedComponent.is_visible,
          content: updatedComponent.content,
        });
        updatedComponent.id = created.id;
      }
      
      // Update local state after successful save
      setPortfolio((prev) => ({
        ...prev,
        components: prev.components.map((c) =>
          (c.id && updatedComponent.id && c.id === updatedComponent.id) ||
          (!c.id && !updatedComponent.id && 
           c.component_type === updatedComponent.component_type &&
           c.order === updatedComponent.order)
            ? updatedComponent
            : c
        ),
      }));
      
      setEditingComponent(null);
      
      toast({
        title: "Success",
        description: "Component updated successfully",
      });
    } catch (error: any) {
      console.error('Error saving component:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save component",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComponent = async (index: number) => {
    const componentToDelete = portfolio.components[index];
    
    // Delete from backend if it exists
    if (portfolio.id && componentToDelete.id) {
      try {
        await portfolioApi.deleteComponent(portfolio.id, componentToDelete.id);
      } catch (error: any) {
        console.error('Error deleting component:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete component from server",
          variant: "destructive",
        });
        return; // Don't delete from local state if server delete failed
      }
    }
    
    // Update local state
    setPortfolio((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
    if (editingComponent && portfolio.components[index] === editingComponent) {
      setEditingComponent(null);
    }
    
    toast({
      title: "Success",
      description: "Component deleted successfully",
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = portfolio.components.findIndex((c, idx) => `${idx}` === active.id);
    const newIndex = portfolio.components.findIndex((c, idx) => `${idx}` === over.id);

    const newComponents = arrayMove(portfolio.components, oldIndex, newIndex);
    // Update order numbers
    newComponents.forEach((comp, idx) => {
      comp.order = idx;
    });

    setPortfolio((prev) => ({
      ...prev,
      components: newComponents,
    }));

    // Update component orders in backend if portfolio exists
    if (portfolio.id) {
      try {
        for (const component of newComponents) {
          if (component.id) {
            try {
              await portfolioApi.updateComponent(portfolio.id, component.id, {
                order: component.order,
              });
            } catch (error) {
              console.error(`Error updating component order for ${component.id}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error updating component orders:', error);
      }
    }

    // Trigger auto-save after drag
    triggerAutoSave();
  };

  const triggerAutoSave = useCallback(() => {
    if (!portfolio.id || !portfolio.title.trim()) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (2 seconds)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaving(true);
        // Prepare data for update - exclude read-only fields
        const updateData: any = {
          title: portfolio.title,
          template: portfolio.template,
          template_type: portfolio.template_type,
          custom_settings: portfolio.custom_settings,
        };
        
        // Only include SEO fields if they exist
        if (portfolio.seo_title) updateData.seo_title = portfolio.seo_title;
        if (portfolio.seo_description) updateData.seo_description = portfolio.seo_description;
        if (portfolio.seo_keywords) updateData.seo_keywords = portfolio.seo_keywords;
        if (portfolio.meta_keywords) updateData.meta_keywords = portfolio.meta_keywords;
        if (portfolio.meta_description) updateData.meta_description = portfolio.meta_description;
        
        await portfolioApi.updatePortfolio(portfolio.id!, updateData);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setAutoSaving(false);
      }
    }, 2000);
  }, [portfolio]);

  const handleToggleVisibility = async (index: number) => {
    const component = portfolio.components[index];
    const newVisibility = !component.is_visible;
    
    // Update local state
    setPortfolio((prev) => {
      const newComponents = [...prev.components];
      newComponents[index].is_visible = newVisibility;
      return {
        ...prev,
        components: newComponents,
      };
    });
    
    // Update in backend if component exists
    if (portfolio.id && component.id) {
      try {
        await portfolioApi.updateComponent(portfolio.id, component.id, {
          is_visible: newVisibility,
        });
      } catch (error: any) {
        console.error('Error updating component visibility:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update component visibility",
          variant: "destructive",
        });
      }
    }
    
    triggerAutoSave();
  };

  const handleSave = async () => {
    if (!portfolio.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a portfolio title",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      if (portfolio.id) {
        // Prepare data for update - exclude read-only fields
        const updateData: any = {
          title: portfolio.title,
        };
        
        // Only include optional fields if they have values
        if (portfolio.template !== undefined && portfolio.template !== null) {
          updateData.template = portfolio.template;
        }
        if (portfolio.template_type) {
          updateData.template_type = portfolio.template_type;
        }
        if (portfolio.custom_settings) {
          updateData.custom_settings = portfolio.custom_settings;
        }
        
        // Only include SEO fields if they have values
        if (portfolio.seo_title) updateData.seo_title = portfolio.seo_title;
        if (portfolio.seo_description) updateData.seo_description = portfolio.seo_description;
        if (portfolio.seo_keywords) updateData.seo_keywords = portfolio.seo_keywords;
        if (portfolio.meta_keywords) updateData.meta_keywords = portfolio.meta_keywords;
        if (portfolio.meta_description) updateData.meta_description = portfolio.meta_description;
        
        await portfolioApi.updatePortfolio(portfolio.id, updateData);
        
        // Components are saved separately when added/updated/deleted
        // No need to save all components here as they're managed individually
        
        toast({
          title: "Success",
          description: "Portfolio updated successfully",
        });
      } else {
        const created = await portfolioApi.createPortfolio({
          title: portfolio.title,
          template: portfolio.template,
          template_type: portfolio.template_type,
          custom_settings: portfolio.custom_settings,
        });
        
        // Create components after portfolio is created
        if (portfolio.components && portfolio.components.length > 0) {
          for (const component of portfolio.components) {
            try {
              await portfolioApi.createComponent(created.id, {
                component_type: component.component_type,
                order: component.order,
                is_visible: component.is_visible,
                content: component.content,
              });
            } catch (componentError) {
              console.error(`Error creating component ${component.component_type}:`, componentError);
            }
          }
        }
        
        toast({
          title: "Success",
          description: "Portfolio created successfully",
        });
        navigate(`/portfolio-builder?id=${created.id}`);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save portfolio",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!portfolio.id) {
      toast({
        title: "Error",
        description: "Please save the portfolio first",
        variant: "destructive",
      });
      return;
    }
    navigate(`/portfolio-preview/${portfolio.id}`);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!portfolio.id) {
      toast({
        title: "Error",
        description: "Please save the portfolio first",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await portfolioApi.uploadProfilePhoto(portfolio.id, file);
      setPortfolio((prev) => ({
        ...prev,
        profile_photo_url: data.profile_photo_url,
        user_profile_photo_url: data.user_profile_photo_url,
      }));
    } catch (error: any) {
      throw error;
    }
  };

  const handlePhotoRemove = async () => {
    if (!portfolio.id) return;
    
    try {
      await portfolioApi.updatePortfolio(portfolio.id, {
        profile_photo: null,
      } as any);
      setPortfolio((prev) => ({
        ...prev,
        profile_photo_url: null,
      }));
    } catch (error: any) {
      throw error;
    }
  };

  const handleSEOUpdate = async (seoData: {
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    meta_keywords?: string;
    meta_description?: string;
  }) => {
    if (!portfolio.id) {
      toast({
        title: "Error",
        description: "Please save the portfolio first",
        variant: "destructive",
      });
      return;
    }

    try {
      await portfolioApi.updatePortfolio(portfolio.id, seoData);
      setPortfolio((prev) => ({
        ...prev,
        ...seoData,
      }));
    } catch (error: any) {
      throw error;
    }
  };

  const handleSuggestionAction = (action: string, suggestion: any) => {
    // Handle different suggestion actions
    if (action === "add_header" || action === "add_about" || action === "add_contact") {
      const componentType = action.replace("add_", "");
      handleAddComponent(componentType);
    } else if (action === "fill_about" || action === "fill_skills" || action === "fill_projects") {
      const componentType = action.replace("fill_", "");
      const existingComponent = portfolio.components.find(
        (c) => c.component_type === componentType
      );
      if (existingComponent) {
        setEditingComponent(existingComponent);
      } else {
        handleAddComponent(componentType);
      }
    } else if (action === "add_meta_description" || action === "add_keywords") {
      // Focus on SEO settings
      toast({
        title: "Info",
        description: "Please use the SEO Settings section to add this",
      });
    } else if (action === "add_profile_photo") {
      toast({
        title: "Info",
        description: "Please use the Profile Photo section to upload a photo",
      });
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading portfolio builder...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreview} disabled={!portfolio.id}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Title */}
            <Card className="p-6">
              <Label htmlFor="title" className="mb-2 block">
                Portfolio Title *
              </Label>
              <Input
                id="title"
                value={portfolio.title}
                onChange={(e) => {
                  setPortfolio((prev) => ({ ...prev, title: e.target.value }));
                  triggerAutoSave();
                }}
                placeholder="e.g., John Doe - Full Stack Developer"
              />
              {lastSaved && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last saved: {lastSaved.toLocaleTimeString()}
                  {autoSaving && " (Saving...)"}
                </p>
              )}
            </Card>

            {/* Template Info */}
            {selectedTemplate && (
              <Card className="p-4 bg-primary/5">
                <p className="text-sm text-muted-foreground mb-1">Selected Template</p>
                <p className="font-semibold">{selectedTemplate.name}</p>
              </Card>
            )}

            {/* Components List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Components</h2>
                <div className="flex items-center gap-2">
                  {COMPONENT_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddComponent(type.value)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {portfolio.components.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No components added yet. Add a component to get started.
                  </p>
                </Card>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={portfolio.components.map((_, idx) => `${idx}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {portfolio.components.map((component, index) => (
                        <SortableComponentItem
                          key={index}
                          component={component}
                          index={index}
                          onEdit={() => setEditingComponent(component)}
                          onDelete={() => handleDeleteComponent(index)}
                          onToggleVisibility={() => handleToggleVisibility(index)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Photo Upload */}
            {portfolio.id && (
              <ProfilePhotoUpload
                currentPhotoUrl={portfolio.profile_photo_url}
                userPhotoUrl={portfolio.user_profile_photo_url}
                onUpload={handlePhotoUpload}
                onRemove={handlePhotoRemove}
              />
            )}

            {/* AI Assistant */}
            {portfolio.id && (
              <AIAssistant
                portfolioId={portfolio.id}
                onSuggestionAction={handleSuggestionAction}
              />
            )}

            {/* SEO Settings */}
            {portfolio.id && (
              <SEOSettings
                portfolioId={portfolio.id}
                seoTitle={portfolio.seo_title}
                seoDescription={portfolio.seo_description}
                seoKeywords={portfolio.seo_keywords}
                metaKeywords={portfolio.meta_keywords}
                metaDescription={portfolio.meta_description}
                onUpdate={handleSEOUpdate}
              />
            )}

            {/* Resume Data Panel */}
            <ResumeDataPanel
              resumeData={resumeData as ResumeData | null}
              onFillComponent={(componentType) => {
                const comp = portfolio.components.find(c => c.component_type === componentType);
                if (comp) {
                  setEditingComponent(comp);
                } else {
                  handleAddComponent(componentType);
                }
              }}
              onFillAll={() => {
                toast({
                  title: "Info",
                  description: "Please use 'Fill from Resume' in each component editor",
                });
              }}
            />

            {/* Component Editor */}
            {editingComponent && (
              <Card className="p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4 capitalize">
                  Edit {editingComponent.component_type}
                </h3>
                <ComponentEditor
                  component={editingComponent}
                  onUpdate={handleUpdateComponent}
                  onCancel={() => setEditingComponent(null)}
                  portfolioId={portfolio.id}
                  resumeData={resumeData}
                />
              </Card>
            )}

            {/* Help Card */}
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Add components to build your portfolio</li>
                <li>• Drag and drop to reorder components</li>
                <li>• Toggle visibility to show/hide components</li>
                <li>• Changes auto-save after 2 seconds</li>
                <li>• Click the eye icon to edit component content</li>
                <li>• Use AI Assistant for content suggestions</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component Editor Component
interface ComponentEditorProps {
  component: Component;
  onUpdate: (component: Component) => void;
  onCancel: () => void;
  portfolioId?: number;
  resumeData?: Record<string, any> | null;
}

const ComponentEditor = ({ component, onUpdate, onCancel, portfolioId, resumeData }: ComponentEditorProps) => {
  const [content, setContent] = useState(component.content);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [availableBlogPosts, setAvailableBlogPosts] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingBlogPosts, setLoadingBlogPosts] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<Record<string, any> | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showResumeMapping, setShowResumeMapping] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [mappingPreview, setMappingPreview] = useState<Record<string, any> | null>(null);
  const [selectedExperienceIndices, setSelectedExperienceIndices] = useState<number[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load projects when editing projects component
  useEffect(() => {
    if (component.component_type === "projects") {
      loadProjects();
    }
  }, [component.component_type]);

  // Load blog posts when editing blog component
  useEffect(() => {
    if (component.component_type === "blog") {
      loadBlogPosts();
    }
  }, [component.component_type]);

  // Initialize field mappings when component or resume data changes
  useEffect(() => {
    try {
      if (resumeData && ['header', 'about', 'skills', 'contact'].includes(component.component_type)) {
        const mappings = getDefaultFieldMappings(component.component_type, resumeData as ResumeData);
        setFieldMappings(mappings);
        if (mappings.length > 0) {
          const selectedFields = mappings.reduce((acc, m) => ({ ...acc, [m.resumeField]: m.enabled }), {});
          const preview = previewFieldMapping(component.component_type, resumeData as ResumeData, selectedFields);
          setMappingPreview(preview);
        } else {
          setMappingPreview(null);
        }
      } else {
        setFieldMappings([]);
        setMappingPreview(null);
      }
    } catch (error) {
      console.error('Error initializing field mappings:', error);
      setFieldMappings([]);
      setMappingPreview(null);
    }
  }, [component.component_type, resumeData]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const projects = await projectApi.getProjects();
      setAvailableProjects(Array.isArray(projects) ? projects : []);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setAvailableProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadBlogPosts = async () => {
    try {
      setLoadingBlogPosts(true);
      const posts = await blogApi.getBlogPosts();
      setAvailableBlogPosts(Array.isArray(posts) ? posts : []);
    } catch (error) {
      console.error("Failed to load blog posts:", error);
      setAvailableBlogPosts([]);
    } finally {
      setLoadingBlogPosts(false);
    }
  };

  const handleSave = () => {
    onUpdate({ ...component, content });
  };

  const handleGenerateWithAI = async () => {
    if (!portfolioId) {
      toast({
        title: "Error",
        description: "Please save the portfolio first before generating content with AI",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingAI(true);
      setShowAISuggestions(true);
      
      const context: Record<string, any> = {
        resume_data: resumeData || {},
        template_type: 'modern', // Could be passed as prop
      };

      const response = await portfolioApi.generateContent(
        portfolioId,
        component.component_type,
        context,
        component.id
      );

      if (response.content) {
        setAiGeneratedContent(response.content);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content with AI",
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleAcceptAIContent = () => {
    if (aiGeneratedContent) {
      setContent(aiGeneratedContent);
      setAiGeneratedContent(null);
      setShowAISuggestions(false);
      toast({
        title: "Success",
        description: "AI-generated content applied",
      });
    }
  };

  const handleRejectAIContent = () => {
    setAiGeneratedContent(null);
    setShowAISuggestions(false);
  };

  const handleFillFromResume = () => {
    if (!resumeData) {
      toast({
        title: "No Resume Data",
        description: "Please upload and parse a resume first",
        variant: "destructive",
      });
      return;
    }
    setShowResumeMapping(true);
  };

  const handleToggleFieldMapping = (index: number) => {
    try {
      if (!resumeData) {
        toast({
          title: "Error",
          description: "Resume data not available",
          variant: "destructive",
        });
        return;
      }
      
      const newMappings = [...fieldMappings];
      if (index < 0 || index >= newMappings.length) return;
      
      newMappings[index].enabled = !newMappings[index].enabled;
      setFieldMappings(newMappings);
      
      // Update preview
      const selectedFields = newMappings.reduce((acc, m) => ({ ...acc, [m.resumeField]: m.enabled }), {});
      const preview = previewFieldMapping(component.component_type, resumeData as ResumeData, selectedFields);
      setMappingPreview(preview);
    } catch (error) {
      console.error('Error toggling field mapping:', error);
      toast({
        title: "Error",
        description: "Failed to update field mapping",
        variant: "destructive",
      });
    }
  };

  const handleApplyResumeMapping = () => {
    try {
      if (!resumeData || fieldMappings.length === 0) {
        toast({
          title: "Error",
          description: "No fields selected for mapping",
          variant: "destructive",
        });
        return;
      }
      
      const enabledMappings = fieldMappings.filter(m => m.enabled);
      if (enabledMappings.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one field to apply",
          variant: "destructive",
        });
        return;
      }
      
      const newContent = applyFieldMapping(content, resumeData as ResumeData, enabledMappings);
      setContent(newContent);
      setShowResumeMapping(false);
      toast({
        title: "Success",
        description: "Component populated from resume data",
      });
    } catch (error: any) {
      console.error('Error applying resume mapping:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to apply resume mapping",
        variant: "destructive",
      });
    }
  };

  const handleClearResumeMapping = () => {
    setShowResumeMapping(false);
    setMappingPreview(null);
  };

  const handleCreateProjectsFromExperience = () => {
    try {
      if (!resumeData?.experience || !Array.isArray(resumeData.experience)) {
        toast({
          title: "No Experience Data",
          description: "No experience entries found in resume",
          variant: "destructive",
        });
        return;
      }

      if (selectedExperienceIndices.length === 0) {
        toast({
          title: "No Selection",
          description: "Please select at least one experience entry to convert",
          variant: "destructive",
        });
        return;
      }

      const projects = convertExperienceToProjects(resumeData.experience, selectedExperienceIndices);
      if (projects.length === 0) {
        toast({
          title: "Error",
          description: "Failed to convert experience entries to projects",
          variant: "destructive",
        });
        return;
      }

      const existingProjects = content.projects || [];
      setContent({ ...content, projects: [...existingProjects, ...projects] });
      setSelectedExperienceIndices([]);
      setShowResumeMapping(false);
      toast({
        title: "Success",
        description: `${projects.length} project(s) created from experience`,
      });
    } catch (error: any) {
      console.error('Error creating projects from experience:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create projects from experience",
        variant: "destructive",
      });
    }
  };

  const canGenerateAI = ['header', 'about', 'skills', 'contact'].includes(component.component_type);
  const canFillFromResume = ['header', 'about', 'skills', 'contact', 'projects'].includes(component.component_type);

  return (
    <div className="space-y-4">
      {canGenerateAI && (
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI Content Generation</span>
            </div>
            {resumeData ? (
              <p className="text-xs text-muted-foreground mt-1">
                Resume data available. Click to generate content based on your resume.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                No resume data found. Upload and parse a resume to enable AI generation.
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateWithAI}
            disabled={generatingAI || !resumeData || !portfolioId}
            className="gap-2"
          >
            {generatingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </>
            )}
          </Button>
        </div>
      )}

      {showAISuggestions && aiGeneratedContent && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">AI Generated Content</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRejectAIContent}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-3 bg-background rounded border">
              {component.component_type === 'header' && (
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Title:</span>
                    <p className="font-medium">{aiGeneratedContent.title || ''}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Subtitle:</span>
                    <p className="text-sm">{aiGeneratedContent.subtitle || ''}</p>
                  </div>
                </div>
              )}
              {component.component_type === 'about' && (
                <div>
                  <span className="text-xs text-muted-foreground">Bio:</span>
                  <p className="text-sm whitespace-pre-wrap mt-1">{aiGeneratedContent.bio || ''}</p>
                </div>
              )}
              {component.component_type === 'skills' && (
                <div>
                  <span className="text-xs text-muted-foreground">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(aiGeneratedContent.skills || []).map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {component.component_type === 'contact' && (
                <div className="space-y-2 text-sm">
                  {aiGeneratedContent.email && (
                    <div>
                      <span className="text-xs text-muted-foreground">Email:</span>
                      <p>{aiGeneratedContent.email}</p>
                    </div>
                  )}
                  {aiGeneratedContent.phone && (
                    <div>
                      <span className="text-xs text-muted-foreground">Phone:</span>
                      <p>{aiGeneratedContent.phone}</p>
                    </div>
                  )}
                  {aiGeneratedContent.location && (
                    <div>
                      <span className="text-xs text-muted-foreground">Location:</span>
                      <p>{aiGeneratedContent.location}</p>
                    </div>
                  )}
                  {aiGeneratedContent.social && (
                    <div>
                      <span className="text-xs text-muted-foreground">Social:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {aiGeneratedContent.social.linkedin && (
                          <span className="text-xs">LinkedIn: {aiGeneratedContent.social.linkedin}</span>
                        )}
                        {aiGeneratedContent.social.github && (
                          <span className="text-xs">GitHub: {aiGeneratedContent.social.github}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAcceptAIContent}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept & Use
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRejectAIContent}
                className="flex-1"
              >
                Reject
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Fill from Resume Section */}
      {canFillFromResume && resumeData && (
        <Card className="p-4 border-primary/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Fill from Resume</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowResumeMapping(!showResumeMapping)}
              >
                {showResumeMapping ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>

            {!showResumeMapping && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFillFromResume}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Fill from Resume
              </Button>
            )}

            {showResumeMapping && component.component_type !== 'projects' && (
              <div className="space-y-3">
                {fieldMappings.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {fieldMappings.map((mapping, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">
                              {mapping.resumeField.replace(/_/g, ' ')} → {mapping.componentField.replace(/\./g, ' → ')}
                            </div>
                            <div className="text-sm mt-1 truncate">
                              {typeof mapping.value === 'string'
                                ? mapping.value
                                : Array.isArray(mapping.value)
                                ? `${mapping.value.length} items`
                                : JSON.stringify(mapping.value).substring(0, 50)}
                            </div>
                          </div>
                          <Switch
                            checked={mapping.enabled}
                            onCheckedChange={() => handleToggleFieldMapping(index)}
                          />
                        </div>
                      ))}
                    </div>
                    {mappingPreview && Object.keys(mappingPreview).length > 0 && (
                      <div className="p-3 bg-muted rounded text-xs">
                        <div className="font-medium mb-2">Preview:</div>
                        <pre className="whitespace-pre-wrap text-xs">
                          {JSON.stringify(mappingPreview, null, 2)}
                        </pre>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleApplyResumeMapping}
                        className="flex-1"
                      >
                        Apply Selected Fields
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearResumeMapping}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No matching resume fields found for this component
                  </p>
                )}
              </div>
            )}

            {showResumeMapping && component.component_type === 'projects' && resumeData && (resumeData as ResumeData).experience && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Select experience entries to convert to projects:
                </p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {((resumeData as ResumeData).experience || []).map((exp: any, index: number) => {
                    const isSelected = selectedExperienceIndices.includes(index);
                    return (
                      <Card
                        key={index}
                        className={`p-3 cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedExperienceIndices(
                              selectedExperienceIndices.filter(i => i !== index)
                            );
                          } else {
                            setSelectedExperienceIndices([...selectedExperienceIndices, index]);
                          }
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {exp.title || exp.position || 'Untitled'}
                            </div>
                            {exp.company && (
                              <div className="text-xs text-muted-foreground">
                                {exp.company}
                              </div>
                            )}
                            {exp.description && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {exp.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateProjectsFromExperience}
                  disabled={selectedExperienceIndices.length === 0}
                  className="w-full"
                >
                  Create {selectedExperienceIndices.length > 0 ? `${selectedExperienceIndices.length} ` : ''}Project{selectedExperienceIndices.length !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {component.component_type === "header" && (
        <>
          <div>
            <Label>Title</Label>
            <Input
              value={content.title || ""}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              value={content.subtitle || ""}
              onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
            />
          </div>
        </>
      )}

      {component.component_type === "about" && (
        <div>
          <Label>Bio</Label>
          <Textarea
            value={content.bio || ""}
            onChange={(e) => setContent({ ...content, bio: e.target.value })}
            rows={6}
          />
        </div>
      )}

      {component.component_type === "skills" && (
        <div>
          <Label>Skills (comma-separated)</Label>
          <Textarea
            value={Array.isArray(content.skills) ? content.skills.join(", ") : ""}
            onChange={(e) =>
              setContent({
                ...content,
                skills: e.target.value.split(",").map((s) => s.trim()),
              })
            }
            rows={4}
            placeholder="e.g., JavaScript, React, Node.js"
          />
        </div>
      )}

      {component.component_type === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Select Projects</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadProjects}
                disabled={loadingProjects}
              >
                {loadingProjects ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/projects")}
              >
                Manage Projects
              </Button>
            </div>
          </div>
          
          {loadingProjects ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Loading projects...</span>
            </div>
          ) : availableProjects.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                No projects available. Create projects first.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/projects")}
              >
                Create Project
              </Button>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {availableProjects.map((project) => {
                const selectedProjects = content.projects || [];
                const isSelected = selectedProjects.some(
                  (p: any) => p.id === project.id || (typeof p === "number" && p === project.id)
                );
                
                return (
                  <Card
                    key={project.id}
                    className={`p-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => {
                      const currentProjects = content.projects || [];
                      let newProjects;
                      
                      if (isSelected) {
                        // Remove project
                        newProjects = currentProjects.filter(
                          (p: any) => (p.id || p) !== project.id
                        );
                      } else {
                        // Add project
                        newProjects = [
                          ...currentProjects,
                          {
                            id: project.id,
                            title: project.title,
                            description: project.description,
                            short_description: project.short_description,
                            image: project.image,
                            github_url: project.github_url,
                            live_url: project.live_url,
                            technologies: project.tags?.map((t: any) => t.name) || [],
                          },
                        ];
                      }
                      
                      setContent({ ...content, projects: newProjects });
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{project.title}</h4>
                          {project.featured && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {project.short_description || project.description}
                        </p>
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.tags.slice(0, 3).map((tag: any) => (
                              <span
                                key={tag.id}
                                className="px-1.5 py-0.5 bg-muted rounded text-xs"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          
          {(content.projects || []).length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {content.projects.length} project{(content.projects.length !== 1 ? "s" : "")} selected
              </p>
            </div>
          )}
        </div>
      )}

      {component.component_type === "blog" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Select Blog Posts</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadBlogPosts}
                disabled={loadingBlogPosts}
              >
                {loadingBlogPosts ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/blog-posts")}
              >
                Manage Blog Posts
              </Button>
            </div>
          </div>
          
          {loadingBlogPosts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Loading blog posts...</span>
            </div>
          ) : availableBlogPosts.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                No blog posts available. Create posts first.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/blog-posts")}
              >
                Create Blog Post
              </Button>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {availableBlogPosts.map((post) => {
                const selectedPosts = content.posts || [];
                const isSelected = selectedPosts.some(
                  (p: any) => p.id === post.id || (typeof p === "number" && p === post.id)
                );
                
                return (
                  <Card
                    key={post.id}
                    className={`p-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => {
                      const currentPosts = content.posts || [];
                      let newPosts;
                      
                      if (isSelected) {
                        // Remove post
                        newPosts = currentPosts.filter(
                          (p: any) => (p.id || p) !== post.id
                        );
                      } else {
                        // Add post
                        newPosts = [
                          ...currentPosts,
                          {
                            id: post.id,
                            title: post.title,
                            excerpt: post.excerpt,
                            content_markdown: post.content_markdown,
                            featured_image: post.featured_image,
                            published: post.published,
                            published_date: post.published_date,
                          },
                        ];
                      }
                      
                      setContent({ ...content, posts: newPosts });
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{post.title}</h4>
                          {post.published ? (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full text-xs">
                              Draft
                            </span>
                          )}
                        </div>
                        {post.excerpt && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          
          {(content.posts || []).length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {content.posts.length} post{(content.posts.length !== 1 ? "s" : "")} selected
              </p>
            </div>
          )}
        </div>
      )}

      {component.component_type === "contact" && (
        <>
          <div>
            <Label>Email</Label>
            <Input
              value={content.email || ""}
              onChange={(e) => setContent({ ...content, email: e.target.value })}
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={content.phone || ""}
              onChange={(e) => setContent({ ...content, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={content.location || ""}
              onChange={(e) => setContent({ ...content, location: e.target.value })}
              placeholder="City, Country"
            />
          </div>
          <div>
            <Label>Social Links</Label>
            <div className="space-y-2 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground">LinkedIn</Label>
                <Input
                  value={content.social?.linkedin || content.linkedin || ""}
                  onChange={(e) => setContent({
                    ...content,
                    social: { ...(content.social || {}), linkedin: e.target.value },
                    linkedin: e.target.value
                  })}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">GitHub</Label>
                <Input
                  value={content.social?.github || content.github || ""}
                  onChange={(e) => setContent({
                    ...content,
                    social: { ...(content.social || {}), github: e.target.value },
                    github: e.target.value
                  })}
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Website/Portfolio</Label>
                <Input
                  value={content.social?.website || content.website || ""}
                  onChange={(e) => setContent({
                    ...content,
                    social: { ...(content.social || {}), website: e.target.value },
                    website: e.target.value
                  })}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1">
          Save
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Sortable Component Item
interface SortableComponentItemProps {
  component: Component;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

const SortableComponentItem = ({
  component,
  index,
  onEdit,
  onDelete,
  onToggleVisibility,
}: SortableComponentItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 ${!component.is_visible ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold capitalize">{component.component_type}</h3>
              {!component.is_visible && (
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full text-xs">
                  Hidden
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">Order: {component.order}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={component.is_visible}
              onCheckedChange={onToggleVisibility}
            />
            <span className="text-xs text-muted-foreground">
              {component.is_visible ? "Visible" : "Hidden"}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {component.component_type === "projects" && component.content.projects ? (
          <p>
            {component.content.projects.length} project{(component.content.projects.length !== 1 ? "s" : "")} added
          </p>
        ) : component.component_type === "blog" && component.content.posts ? (
          <p>
            {component.content.posts.length} post{(component.content.posts.length !== 1 ? "s" : "")} added
          </p>
        ) : component.component_type === "skills" && component.content.skills ? (
          <p>
            {Array.isArray(component.content.skills) ? component.content.skills.length : 0} skill{(Array.isArray(component.content.skills) && component.content.skills.length !== 1 ? "s" : "")}
          </p>
        ) : (
          <p>{JSON.stringify(component.content).substring(0, 100)}...</p>
        )}
      </div>
    </Card>
  );
};

export default PortfolioBuilder;

