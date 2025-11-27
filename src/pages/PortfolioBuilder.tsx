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
  User,
  Code,
  Briefcase,
  BookOpen,
  Mail,
  Layers,
  Palette,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowUpDown,
  Layout,
  Zap,
  Search,
  Settings,
  Menu,
  ChevronRight,
  Download,
  Globe,
  Award,
  Star,
  MessageSquare,
  Target,
  TrendingUp,
  Image as ImageIcon,
  Video,
  Calendar,
  MapPin,
  Phone,
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Globe as GlobeIcon,
  Heart,
  ThumbsUp,
  Quote,
  BarChart3,
  Grid3x3,
  List,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { portfolioApi, authApi, api, projectApi, blogApi, resumeApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  { 
    value: "hero_banner", 
    label: "Hero Banner", 
    icon: ImageIcon,
    description: "Immersive hero with background media and CTAs",
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
  },
  { 
    value: "about_me_card", 
    label: "About Me Card", 
    icon: User,
    description: "Personal bio with image and social links",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20"
  },
  { 
    value: "skills_cloud", 
    label: "Skills Cloud & Bars", 
    icon: Zap,
    description: "Visual skills cloud with optional progress bars",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
  },
  { 
    value: "experience_timeline", 
    label: "Experience Timeline", 
    icon: Calendar,
    description: "Chronological work history timeline",
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
  },
  { 
    value: "project_grid", 
    label: "Project Grid", 
    icon: Grid3x3,
    description: "Filterable project showcase with hover effects",
    color: "bg-green-500/10 text-green-500 border-green-500/20"
  },
  { 
    value: "services_section", 
    label: "Services Section", 
    icon: Target,
    description: "Service offerings with icons and descriptions",
    color: "bg-teal-500/10 text-teal-500 border-teal-500/20"
  },
  { 
    value: "achievements_counters", 
    label: "Achievements Counters", 
    icon: Award,
    description: "Animated counters highlighting achievements",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  },
  { 
    value: "testimonials_carousel", 
    label: "Testimonials Carousel", 
    icon: MessageSquare,
    description: "Carousel of testimonials with ratings",
    color: "bg-rose-500/10 text-rose-500 border-rose-500/20"
  },
  { 
    value: "blog_preview_grid", 
    label: "Blog Preview Grid", 
    icon: BookOpen,
    description: "Grid of recent blog posts and previews",
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20"
  },
  { 
    value: "contact_form", 
    label: "Contact Form", 
    icon: Mail,
    description: "Interactive contact form with validation",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20"
  },
  { 
    value: "footer", 
    label: "Footer", 
    icon: Layers,
    description: "Footer with links, social media, and copyright",
    color: "bg-slate-500/10 text-slate-500 border-slate-500/20"
  },
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
  const [availableResumes, setAvailableResumes] = useState<Array<{id: number; file: string; uploaded_at: string; status: string}>>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [activeTab, setActiveTab] = useState<"components" | "settings" | "seo" | "preview">("components");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

    // Load available resumes and resume data
    loadAvailableResumes();
    loadResumeData();
  }, [location, isAuthenticated]);

  // Refresh resume data when window regains focus (user might have parsed a new resume)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        loadAvailableResumes();
        if (selectedResumeId) {
          loadResumeData(selectedResumeId);
        } else {
          loadResumeData();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, selectedResumeId]);

  const loadAvailableResumes = async () => {
    try {
      setLoadingResumes(true);
      const resumes = await resumeApi.getResumes();
      const completedResumes = resumes.filter((r: any) => r.status === 'completed');
      setAvailableResumes(completedResumes);
      
      // Set selected resume to latest if not already set
      if (completedResumes.length > 0 && !selectedResumeId) {
        const latestResume = completedResumes[0];
        setSelectedResumeId(latestResume.id);
      }
    } catch (error) {
      console.error('Failed to load available resumes:', error);
      setAvailableResumes([]);
    } finally {
      setLoadingResumes(false);
    }
  };

  const loadResumeData = async (resumeId?: number | null) => {
    try {
      setLoadingResumeData(true);
      const idToLoad = resumeId ?? selectedResumeId;
      const data = await portfolioApi.getResumeData(idToLoad || undefined);
      if (data.has_resume && data.structured_data) {
        setResumeData(data.structured_data);
        // Update selected resume ID if it was loaded
        if (data.resume_id && !selectedResumeId) {
          setSelectedResumeId(data.resume_id);
        }
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

  const handleResumeSelectionChange = async (resumeId: number | null) => {
    setSelectedResumeId(resumeId);
    await loadResumeData(resumeId);
  };

  const handleRefreshResumeData = async () => {
    await loadAvailableResumes();
    // After refreshing resumes, check if selected resume still exists
    const resumes = await resumeApi.getResumes();
    const completedResumes = resumes.filter((r: any) => r.status === 'completed');
    
    if (selectedResumeId) {
      const resumeExists = completedResumes.some((r: any) => r.id === selectedResumeId);
      if (!resumeExists && completedResumes.length > 0) {
        // Selected resume was deleted, switch to latest
        const latestResume = completedResumes[0];
        setSelectedResumeId(latestResume.id);
        await loadResumeData(latestResume.id);
      } else {
        await loadResumeData(selectedResumeId);
      }
    } else if (completedResumes.length > 0) {
      // No resume selected, select latest
      const latestResume = completedResumes[0];
      setSelectedResumeId(latestResume.id);
      await loadResumeData(latestResume.id);
    } else {
      // No resumes available
      setSelectedResumeId(null);
      setResumeData(null);
    }
  };

  const loadPortfolio = async (id: number) => {
    try {
      const data: any = await portfolioApi.getPortfolio(id);
      setPortfolio({
        id: data.id,
        title: data.title,
        template: data.template,
        template_type: data.template_type,
        custom_settings: data.custom_settings || {},
        components: data.components || [],
        profile_photo: data.profile_photo || null,
        profile_photo_url: data.profile_photo_url || null,
        user_profile_photo_url: data.user_profile_photo_url || null,
        seo_title: data.seo_title || undefined,
        seo_description: data.seo_description || undefined,
        seo_keywords: data.seo_keywords || undefined,
        meta_keywords: data.meta_keywords || undefined,
        meta_description: data.meta_description || undefined,
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
    
    // Calculate next available order by finding max order and adding 1
    const maxOrder = portfolio.components.length > 0 
      ? Math.max(...portfolio.components.map(c => c.order ?? 0))
      : -1;
    const nextOrder = maxOrder + 1;
    
    const newComponent: Component = {
      component_type: type,
      order: nextOrder,
      is_visible: true,
      content: getDefaultContent(type),
    };
    
    // Save component to backend
    try {
      const created: any = await portfolioApi.createComponent(portfolio.id!, {
        component_type: newComponent.component_type,
        order: newComponent.order,
        is_visible: newComponent.is_visible,
        content: newComponent.content,
      });
      newComponent.id = created.id;
      
      // Update local state
    setPortfolio((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));
      
      // Set as editing component
    setEditingComponent(newComponent);
      
      toast({
        title: "Success",
        description: "Component added successfully",
      });
    } catch (error: any) {
      console.error('Error creating component:', error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to create component";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getDefaultContent = (type: string): Record<string, any> => {
    const defaults: Record<string, Record<string, any>> = {
      hero_banner: { 
        title: "", 
        subtitle: "", 
        background_image: "", 
        background_video: "",
        cta_buttons: [{ text: "Get Started", url: "#", variant: "primary" }],
        overlay_opacity: 0.5
      },
      about_me_card: { 
        bio: "", 
        image: "", 
        name: "",
        title: "",
        social_links: {
          linkedin: "",
          github: "",
          twitter: "",
          email: ""
        }
      },
      skills_cloud: { skills: [], display_mode: "cloud" },
      experience_timeline: { experiences: [] },
      project_grid: { projects: [], filter_categories: [], show_filters: true },
      services_section: { services: [] },
      achievements_counters: { counters: [] },
      testimonials_carousel: { testimonials: [] },
      blog_preview_grid: { posts: [], posts_per_row: 3 },
      contact_form: { 
        title: "Contact Info",
        description: "",
        fields: ["name", "email", "message"],
        submit_button_text: "Send Message",
        contact_info: {
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          github: "",
          website: ""
        }
      },
      footer: {
        copyright_text: "",
        links: [],
        social_links: {},
        columns: []
      },
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
        const created: any = await portfolioApi.createComponent(portfolio.id, {
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
      
      // Update editing component if it's the same one
      if (editingComponent && 
          ((editingComponent.id && updatedComponent.id && editingComponent.id === updatedComponent.id) ||
           (!editingComponent.id && !updatedComponent.id && 
            editingComponent.component_type === updatedComponent.component_type))) {
        setEditingComponent(updatedComponent);
      }
      
      toast({
        title: "Success",
        description: "Component updated successfully",
      });
    } catch (error: any) {
      console.error('Error saving component:', error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to save component";
      toast({
        title: "Error",
        description: errorMessage,
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
      const data: any = await portfolioApi.uploadProfilePhoto(portfolio.id, file);
      // Update local state with photo URLs
      setPortfolio((prev) => ({
        ...prev,
        profile_photo_url: data.profile_photo_url || null,
        user_profile_photo_url: data.user_profile_photo_url || null,
      }));
      // Reload full portfolio to ensure all data is fresh and up-to-date
      await loadPortfolio(portfolio.id);
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
    const componentAliasMap: Record<string, string> = {
      header: "hero_banner",
      about: "about_me_card",
      contact: "contact_form",
      skills: "skills_cloud",
      projects: "project_grid",
      blog: "blog_preview_grid",
      testimonials: "testimonials_carousel",
      services: "services_section",
      experience: "experience_timeline",
    };

    if (action.startsWith("add_") || action.startsWith("fill_")) {
      const baseKey = action.replace(/^(add|fill)_/, "");
      const componentType = componentAliasMap[baseKey] || baseKey;

      if (!COMPONENT_TYPES.find((type) => type.value === componentType)) {
        toast({
          title: "Unsupported suggestion",
          description: `Component type "${componentType}" is not available.`,
        });
        return;
      }

      if (action.startsWith("add_")) {
        handleAddComponent(componentType);
      } else {
        const existingComponent = portfolio.components.find(
          (c) => c.component_type === componentType
        );
        if (existingComponent) {
          setEditingComponent(existingComponent);
        } else {
          handleAddComponent(componentType);
        }
      }
      return;
    }

    if (action === "add_meta_description" || action === "add_keywords") {
      toast({
        title: "Info",
        description: "Please use the SEO Settings section to add this",
      });
      return;
    }

    if (action === "add_profile_photo") {
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
    <div className="min-h-screen bg-background relative overflow-hidden bg-professional-image-3">
      {/* Professional Background Overlay */}
      <div className="bg-overlay-dark"></div>
      
      {/* Professional Header Bar */}
      <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm relative">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Navigation */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
          </Button>
              {portfolio.id && portfolio.title && (
                <>
                  <div className="hidden md:block h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-sm hidden md:inline">{portfolio.title}</span>
                  </div>
                </>
              )}
            </div>

            {/* Center: Status */}
            <div className="hidden lg:flex items-center gap-3 flex-1 justify-center">
              {autoSaving ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Saving...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePreview} disabled={!portfolio.id} size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
            </Button>
              <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
              {saving ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                </>
              )}
            </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Professional Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-0' : 'w-72'} lg:w-72 border-r bg-muted/30 transition-all duration-300 overflow-hidden flex-shrink-0 flex flex-col`}>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Portfolio Info Card */}
            <Card className="p-4 bg-background shadow-sm border">
              <div className="space-y-4">
            {/* Portfolio Title */}
                <div className="space-y-2">
                  <Label htmlFor="sidebar-title" className="text-xs font-medium text-muted-foreground">
                    Portfolio Title
              </Label>
              <Input
                    id="sidebar-title"
                value={portfolio.title}
                onChange={(e) => {
                  setPortfolio((prev) => ({ ...prev, title: e.target.value }));
                  triggerAutoSave();
                }}
                    placeholder="Enter title..."
                    className="h-9 text-sm"
                  />
                </div>

                {/* Template Info */}
                {selectedTemplate ? (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Template</Label>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/10">
                      <Palette className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium flex-1 truncate">{selectedTemplate.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => navigate("/choose-template")}
                      >
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/choose-template")}
                    className="w-full justify-start gap-2 h-9"
                  >
                    <Palette className="w-4 h-4" />
                    Choose Template
                  </Button>
                )}

                {/* Quick Stats */}
                <div className="pt-2 border-t space-y-2">
                  {portfolio.components.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Components</span>
                      <span className="font-medium">{portfolio.components.length}</span>
                    </div>
                  )}
              {lastSaved && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Last saved</span>
                      <span className="font-medium">{lastSaved.toLocaleTimeString()}</span>
                    </div>
                  )}
                  {(portfolio as any).is_published !== undefined && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        (portfolio as any).is_published 
                          ? 'bg-green-500/10 text-green-600' 
                          : 'bg-yellow-500/10 text-yellow-600'
                      }`}>
                        {(portfolio as any).is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Navigation Tabs */}
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Navigation
              </div>
              <Button
                variant={activeTab === "components" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 h-9"
                onClick={() => setActiveTab("components")}
              >
                <Layout className="w-4 h-4" />
                Components
                {portfolio.components.length > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                    {portfolio.components.length}
                  </span>
                )}
              </Button>
              <Button
                variant={activeTab === "settings" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 h-9"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button
                variant={activeTab === "seo" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 h-9"
                onClick={() => setActiveTab("seo")}
              >
                <Search className="w-4 h-4" />
                SEO & Tools
              </Button>
              <Button
                variant={activeTab === "preview" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 h-9"
                onClick={() => setActiveTab("preview")}
                disabled={!portfolio.id}
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-1 pt-2 border-t">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </div>
                    <Button
                variant="default"
                className="w-full justify-start gap-2 h-9"
                onClick={() => {
                  if (activeTab !== "components") setActiveTab("components");
                  // Focus on add component
                }}
              >
                <Plus className="w-4 h-4" />
                Add Component
              </Button>
              {portfolio.id && (
                <Button
                      variant="outline"
                  className="w-full justify-start gap-2 h-9"
                  onClick={() => navigate("/export")}
                >
                  <Download className="w-4 h-4" />
                  Export Portfolio
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6">
            {/* Tab Content */}
            {activeTab === "components" && (
              <div className="space-y-6">
                {/* Components Header */}
                <div>
                  <h1 className="text-2xl font-bold">Components</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Build your portfolio by adding and organizing components
                  </p>
                </div>

                {/* Component Selection Grid */}
                <TooltipProvider>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 w-full">
                    {COMPONENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isAdded = portfolio.components.some(c => c.component_type === type.value);
                      return (
                        <Tooltip key={type.value}>
                          <TooltipTrigger asChild>
                            <Card
                              onClick={() => !isAdded && handleAddComponent(type.value)}
                              className={cn(
                                "relative p-3 cursor-pointer transition-all duration-200 group",
                                "border hover:shadow-md hover:shadow-primary/5",
                                "hover:-translate-y-0.5",
                                isAdded
                                  ? "opacity-60 cursor-not-allowed bg-muted/20 border-muted/50"
                                  : cn(
                                      "hover:border-primary/30",
                                      type.color,
                                      "hover:bg-gradient-to-br hover:from-background hover:to-muted/10"
                                    )
                              )}
                            >
                              {/* Status Badge */}
                              {isAdded && (
                                <div className="absolute top-2 right-2 z-10">
                                  <div className="bg-green-500 rounded-full p-1 shadow-sm">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </div>
                                </div>
                              )}

                              {/* Icon and Name - Compact Layout */}
                              <div className="flex items-center gap-2.5">
                                <div className={cn(
                                  "p-2 rounded-lg transition-all duration-200 flex-shrink-0",
                                  isAdded
                                    ? "bg-muted/50"
                                    : cn(
                                        type.color,
                                        "group-hover:scale-105"
                                      )
                                )}>
                                  <Icon className={cn(
                                    "w-5 h-5 transition-transform duration-200",
                                    !isAdded && "group-hover:scale-110"
                                  )} />
                                </div>
                                
                                {/* Component Name */}
                                <div className="flex-1 min-w-0">
                                  <h3 className={cn(
                                    "font-medium text-sm leading-tight truncate",
                                    isAdded ? "text-muted-foreground" : "text-foreground"
                                  )}>
                                    {type.label}
                                  </h3>
                                </div>
                              </div>

                              {/* Hover Indicator */}
                              {!isAdded && (
                                <div className="absolute inset-0 rounded-lg border border-primary/0 group-hover:border-primary/15 transition-all duration-200 pointer-events-none" />
                              )}
                            </Card>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="font-medium mb-1">{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>

                {/* Components Workspace */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Components List */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card className="p-6 shadow-sm border">
                      <div className="space-y-4">

                        {/* Components Content */}
              {portfolio.components.length === 0 ? (
                          <div className="p-12 border-2 border-dashed rounded-lg bg-muted/30 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                              <Layout className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No components added yet</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                              Start building your portfolio by adding components
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {COMPONENT_TYPES.map((type) => {
                                const Icon = type.icon;
                                return (
                                  <Button
                                    key={type.value}
                                    variant="outline"
                                    onClick={() => handleAddComponent(type.value)}
                                    className="h-auto py-3 flex flex-col items-center gap-2"
                                  >
                                    <div className={`p-2 rounded-lg ${type.color}`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium">{type.label}</span>
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground px-2 py-1.5 bg-muted/30 rounded-md">
                              <span className="flex items-center gap-2">
                                <ArrowUpDown className="w-3 h-3" />
                                Drag to reorder
                              </span>
                              <span>
                                {portfolio.components.filter(c => c.is_visible).length} of {portfolio.components.length} visible
                              </span>
                            </div>
                            
                            {/* Profile Photo Component - Special non-draggable component */}
                            {portfolio.id && (
                              <Card className="p-4 rounded-lg transition-all duration-200 hover:shadow-md hover:border-primary/50 border border-solid shadow-sm group mb-2">
                                <div className="flex items-start gap-3">
                                  {/* Icon placeholder (no drag handle) */}
                                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 border-2 border-purple-500/20 flex-shrink-0">
                                    <User className="w-5 h-5" />
                                  </div>
                                  
                                  {/* Component details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <h3 className="font-semibold text-base">Profile Photo</h3>
                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs font-medium flex items-center gap-1">
                                          <Eye className="w-3 h-3" />
                                          Always Visible
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Profile Photo Upload Component - embedded without its own card wrapper */}
                                    <div className="mt-2">
                                      <ProfilePhotoUpload
                                        currentPhotoUrl={portfolio.profile_photo_url}
                                        userPhotoUrl={portfolio.user_profile_photo_url}
                                        onUpload={handlePhotoUpload}
                                        onRemove={handlePhotoRemove}
                                        className="border-0 shadow-none p-0 rounded-lg"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            )}
                            
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={portfolio.components.map((_, idx) => `${idx}`)}
                    strategy={verticalListSortingStrategy}
                  >
                                <div className="space-y-2">
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
                          </div>
              )}
            </div>
                    </Card>
          </div>

                  {/* Component Editor Panel */}
                  <div className="lg:col-span-1">
                    {editingComponent ? (
                      <Card className="p-6 shadow-sm border sticky top-6">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-sm capitalize">
                  Edit {editingComponent.component_type}
                </h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingComponent(null)}
                            className="h-7 w-7"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
                <ComponentEditor
                  component={editingComponent}
                  onUpdate={handleUpdateComponent}
                  onCancel={() => setEditingComponent(null)}
                  portfolioId={portfolio.id}
                  resumeData={resumeData}
                  selectedResumeId={selectedResumeId}
                  portfolio={portfolio}
                />
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-6 shadow-sm border bg-muted/20 border-dashed">
                        <div className="text-center py-8">
                          <Eye className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Select a component to edit
                          </p>
                        </div>
              </Card>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold">Settings</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure your portfolio settings and preferences
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Template Settings */}
                  <Card className="p-6 shadow-sm border">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b">
                        <Palette className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Template</h3>
          </div>
                      {selectedTemplate ? (
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <p className="text-sm font-medium">{selectedTemplate.name}</p>
        </div>
                          <Button
                            variant="outline"
                            onClick={() => navigate("/choose-template")}
                            className="w-full"
                          >
                            Change Template
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => navigate("/choose-template")}
                          className="w-full"
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          Choose Template
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* SEO & Tools Tab */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold">SEO & Optimization</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Optimize your portfolio for search engines and enhance with AI tools
                  </p>
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* SEO Settings */}
                  <div className="lg:col-span-2">
                    {portfolio.id ? (
                      <SEOSettings
                        portfolioId={portfolio.id}
                        seoTitle={portfolio.seo_title}
                        seoDescription={portfolio.seo_description}
                        seoKeywords={portfolio.seo_keywords}
                        metaKeywords={portfolio.meta_keywords}
                        metaDescription={portfolio.meta_description}
                        onUpdate={handleSEOUpdate}
                      />
                    ) : (
                      <Card className="p-6 shadow-sm border">
                        <div className="text-center py-8">
                          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Save your portfolio to configure SEO settings
                          </p>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* AI Assistant & Resume Data */}
                  <div className="space-y-6">
                    {portfolio.id ? (
                      <AIAssistant
                        portfolioId={portfolio.id}
                        onSuggestionAction={handleSuggestionAction}
                      />
                    ) : (
                      <Card className="p-6 shadow-sm border">
                        <div className="text-center py-8">
                          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Save your portfolio to enable AI Assistant
                          </p>
                        </div>
                      </Card>
                    )}

                    <ResumeDataPanel
                      resumeData={resumeData as ResumeData | null}
                      availableResumes={availableResumes}
                      selectedResumeId={selectedResumeId}
                      loadingResumes={loadingResumes}
                      loadingResumeData={loadingResumeData}
                      onResumeSelect={handleResumeSelectionChange}
                      onRefresh={handleRefreshResumeData}
                      onFillComponent={(componentType) => {
                        const comp = portfolio.components.find(c => c.component_type === componentType);
                        if (comp) {
                          setEditingComponent(comp);
                          setActiveTab("components");
                        } else {
                          handleAddComponent(componentType);
                          setActiveTab("components");
                        }
                      }}
                      onFillAll={() => {
                        toast({
                          title: "Info",
                          description: "Please use 'Fill from Resume' in each component editor",
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === "preview" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold">Preview & Export</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Preview your portfolio and export it
                  </p>
                </div>
                {portfolio.id ? (
                  <Card className="p-6 shadow-sm border">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b">
                        <div>
                          <h3 className="font-semibold">Live Preview</h3>
                          <p className="text-sm text-muted-foreground">
                            See how your portfolio looks to visitors
                          </p>
                        </div>
                        <Button onClick={handlePreview} className="gap-2">
                          <Eye className="w-4 h-4" />
                          Open Preview
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">Export Portfolio</h4>
                          <p className="text-xs text-muted-foreground">
                            Download your portfolio as HTML/CSS/JS
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => navigate("/export")} className="gap-2">
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6 shadow-sm border">
                    <div className="text-center py-12">
                      <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Save to Preview</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Save your portfolio first to preview and export it
                      </p>
                      <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" />
                        Save Portfolio
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
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
  selectedResumeId?: number | null;
  portfolio?: any;
}

const ComponentEditor = ({ component, onUpdate, onCancel, portfolioId, resumeData, selectedResumeId, portfolio }: ComponentEditorProps) => {
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
    if (component.component_type === "project_grid") {
      loadProjects();
    }
  }, [component.component_type]);

  // Load blog posts when editing blog component
  useEffect(() => {
    if (component.component_type === "blog_preview_grid") {
      loadBlogPosts();
    }
  }, [component.component_type]);

  // Initialize field mappings when component or resume data changes
  useEffect(() => {
    try {
      if (resumeData && ['hero_banner', 'about_me_card', 'skills_cloud', 'experience_timeline', 'project_grid', 'contact_form'].includes(component.component_type)) {
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
      setShowAISuggestions(false);
      setAiGeneratedContent(null);
      
      // Ensure we use the latest resume data from selected resume
      let currentResumeData = resumeData;
      if (selectedResumeId) {
        try {
          const data = await portfolioApi.getResumeData(selectedResumeId);
          if (data.has_resume && data.structured_data) {
            currentResumeData = data.structured_data;
          }
        } catch (error) {
          console.error('Failed to fetch selected resume data for AI:', error);
          // Fall back to existing resumeData
        }
      }
      
      const context: Record<string, any> = {
        resume_data: currentResumeData || {},
        template_type: portfolio.template_type || 'modern',
        resume_id: selectedResumeId || undefined,
      };

      const response = await portfolioApi.generateContent(
        portfolioId,
        component.component_type,
        context,
        component.id
      );

      if (response && response.content) {
        setAiGeneratedContent(response.content);
        setShowAISuggestions(true);
        toast({
          title: "Success",
          description: "Content generated successfully",
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error('Error generating AI content:', error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to generate content with AI";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setShowAISuggestions(false);
      setAiGeneratedContent(null);
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
        description: "Please upload and parse a resume first, or select a resume from the Resume Data panel",
        variant: "destructive",
      });
      return;
    }
    
    // Always re-initialize field mappings to ensure they match current resume data
    try {
      const mappings = getDefaultFieldMappings(component.component_type, resumeData as ResumeData);
      setFieldMappings(mappings);
      if (mappings.length > 0) {
        const selectedFields = mappings.reduce((acc, m) => ({ ...acc, [m.resumeField]: m.enabled }), {});
        const preview = previewFieldMapping(component.component_type, resumeData as ResumeData, selectedFields);
        setMappingPreview(preview);
      } else {
        toast({
          title: "No Matching Fields",
          description: "No matching resume fields found for this component type",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error('Error initializing field mappings:', error);
      toast({
        title: "Error",
        description: "Failed to initialize field mappings",
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
      if (!resumeData) {
        toast({
          title: "Error",
          description: "Resume data not available",
          variant: "destructive",
        });
        return;
      }
      
      if (fieldMappings.length === 0) {
        toast({
          title: "Error",
          description: "No field mappings available for this component",
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
      if (newContent && Object.keys(newContent).length > 0) {
        setContent(newContent);
        setShowResumeMapping(false);
        toast({
          title: "Success",
          description: "Component populated from resume data",
        });
      } else {
        toast({
          title: "Warning",
          description: "No content was applied. Please check your field mappings.",
          variant: "destructive",
        });
      }
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

  const canGenerateAI = [
    'hero_banner',
    'about_me_card',
    'skills_cloud',
    'experience_timeline',
    'project_grid',
    'services_section',
    'achievements_counters',
    'testimonials_carousel',
    'blog_preview_grid',
    'contact_form',
  ].includes(component.component_type);
  const canFillFromResume = [
    'hero_banner',
    'about_me_card',
    'skills_cloud',
    'experience_timeline',
    'project_grid',
    'contact_form',
  ].includes(component.component_type);

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
              {(() => {
                switch (component.component_type) {
                  case 'hero_banner':
                    return (
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Title:</span>
                          <p className="font-medium">{aiGeneratedContent.title || ''}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Subtitle:</span>
                          <p className="text-sm whitespace-pre-wrap">
                            {aiGeneratedContent.subtitle || ''}
                          </p>
                        </div>
                      </div>
                    );
                  case 'about_me_card':
                    return (
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Name:</span>
                          <p className="font-medium">{aiGeneratedContent.name || ''}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Title:</span>
                          <p className="text-sm">{aiGeneratedContent.title || ''}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Bio:</span>
                          <p className="text-sm whitespace-pre-wrap">
                            {aiGeneratedContent.bio || ''}
                          </p>
                        </div>
                      </div>
                    );
                  case 'skills_cloud':
                    return (
                      <div>
                        <span className="text-xs text-muted-foreground">Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(aiGeneratedContent.skills || []).map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  case 'experience_timeline':
                    return (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">Experiences:</span>
                        <div className="space-y-2">
                          {(aiGeneratedContent.experiences || []).map((exp: any, idx: number) => (
                            <div key={idx} className="p-2 border rounded text-xs space-y-1">
                              <div className="font-medium text-sm">{exp.title}</div>
                              {exp.company && (
                                <div className="text-muted-foreground">{exp.company}</div>
                              )}
                              {(exp.startDate || exp.endDate) && (
                                <div className="text-muted-foreground">
                                  {exp.startDate} - {exp.endDate || 'Present'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  case 'project_grid':
                    return (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">Projects:</span>
                        <div className="space-y-2">
                          {(aiGeneratedContent.projects || []).map((project: any, idx: number) => (
                            <div key={idx} className="p-2 border rounded text-xs space-y-1">
                              <div className="font-medium text-sm">{project.title}</div>
                              {project.description && (
                                <div className="text-muted-foreground">{project.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  case 'services_section':
                    return (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">Services:</span>
                        <div className="space-y-2">
                          {(aiGeneratedContent.services || []).map((service: any, idx: number) => (
                            <div key={idx} className="p-2 border rounded text-xs space-y-1">
                              <div className="font-medium text-sm">{service.title}</div>
                              {service.description && (
                                <div className="text-muted-foreground">{service.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  case 'achievements_counters':
                    return (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">Counters:</span>
                        <div className="space-y-1">
                          {(aiGeneratedContent.counters || []).map((counter: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs border p-2 rounded">
                              <span>{counter.label}</span>
                              <span className="font-medium">{counter.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  case 'testimonials_carousel':
                    return (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">Testimonials:</span>
                        <div className="space-y-2">
                          {(aiGeneratedContent.testimonials || []).map((testimonial: any, idx: number) => (
                            <div key={idx} className="p-2 border rounded text-xs space-y-1">
                              <div className="font-medium text-sm">{testimonial.name}</div>
                              {testimonial.content && (
                                <div className="text-muted-foreground">{testimonial.content}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  case 'blog_preview_grid':
                    return (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">Posts:</span>
                        <div className="space-y-2">
                          {(aiGeneratedContent.posts || []).map((post: any, idx: number) => (
                            <div key={idx} className="p-2 border rounded text-xs space-y-1">
                              <div className="font-medium text-sm">{post.title}</div>
                              {post.excerpt && (
                                <div className="text-muted-foreground">{post.excerpt}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  case 'contact_form':
                    return (
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Title:</span>
                          <p className="font-medium">{aiGeneratedContent.title || ''}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Description:</span>
                          <p className="text-sm whitespace-pre-wrap">
                            {aiGeneratedContent.description || ''}
                          </p>
                        </div>
                      </div>
                    );
                  case 'footer':
                    return (
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Copyright:</span>
                          <p className="font-medium text-sm">
                            {aiGeneratedContent.copyright_text || ''}
                          </p>
                        </div>
                        {aiGeneratedContent.social_links && (
                          <div>
                            <span className="text-muted-foreground">Social:</span>
                            <div className="flex flex-col gap-1 mt-1">
                              {Object.entries(aiGeneratedContent.social_links).map(
                                ([key, value]) => (
                                  <div key={key} className="capitalize">
                                    {key}: <span className="text-muted-foreground">{value as string}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  default:
                    return (
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(aiGeneratedContent, null, 2)}
                      </pre>
                    );
                }
              })()}
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

            {showResumeMapping && component.component_type !== 'project_grid' && (
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

            {showResumeMapping && component.component_type === 'project_grid' && resumeData && (resumeData as ResumeData).experience && (
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

      {component.component_type === "project_grid" && (
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

      {component.component_type === "blog_preview_grid" && (
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

      {component.component_type === "hero_banner" && (
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={content.title || ""}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              placeholder="Main headline"
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Textarea
              value={content.subtitle || ""}
              onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
              rows={2}
              placeholder="Supporting text"
            />
          </div>
          <div>
            <Label>Background Image URL</Label>
            <Input
              value={content.background_image || ""}
              onChange={(e) => setContent({ ...content, background_image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <Label>Background Video URL (optional)</Label>
            <Input
              value={content.background_video || ""}
              onChange={(e) => setContent({ ...content, background_video: e.target.value })}
              placeholder="https://example.com/video.mp4"
            />
          </div>
          <div>
            <Label>Overlay Opacity (0-1)</Label>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={content.overlay_opacity || 0.5}
              onChange={(e) => setContent({ ...content, overlay_opacity: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label>CTA Buttons</Label>
            <div className="space-y-2">
              {(content.cta_buttons || []).map((btn: any, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={btn.text || ""}
                    onChange={(e) => {
                      const newButtons = [...(content.cta_buttons || [])];
                      newButtons[idx] = { ...btn, text: e.target.value };
                      setContent({ ...content, cta_buttons: newButtons });
                    }}
                    placeholder="Button text"
                  />
                  <Input
                    value={btn.url || ""}
                    onChange={(e) => {
                      const newButtons = [...(content.cta_buttons || [])];
                      newButtons[idx] = { ...btn, url: e.target.value };
                      setContent({ ...content, cta_buttons: newButtons });
                    }}
                    placeholder="URL"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newButtons = (content.cta_buttons || []).filter((_: any, i: number) => i !== idx);
                      setContent({ ...content, cta_buttons: newButtons });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setContent({
                    ...content,
                    cta_buttons: [...(content.cta_buttons || []), { text: "New Button", url: "#", variant: "primary" }],
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Button
              </Button>
            </div>
          </div>
        </div>
      )}

      {component.component_type === "about_me_card" && (
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={content.name || ""}
              onChange={(e) => setContent({ ...content, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Title/Position</Label>
            <Input
              value={content.title || ""}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
            />
          </div>
        <div>
          <Label>Bio</Label>
          <Textarea
            value={content.bio || ""}
            onChange={(e) => setContent({ ...content, bio: e.target.value })}
            rows={6}
          />
          </div>
          <div>
            <Label>Profile Image URL</Label>
            <Input
              value={content.image || ""}
              onChange={(e) => setContent({ ...content, image: e.target.value })}
            />
          </div>
          <div>
            <Label>Social Links</Label>
            <div className="space-y-2">
              <Input
                value={content.social_links?.linkedin || ""}
                onChange={(e) => setContent({
                  ...content,
                  social_links: { ...content.social_links, linkedin: e.target.value },
                })}
                placeholder="LinkedIn URL"
              />
              <Input
                value={content.social_links?.github || ""}
                onChange={(e) => setContent({
                  ...content,
                  social_links: { ...content.social_links, github: e.target.value },
                })}
                placeholder="GitHub URL"
              />
              <Input
                value={content.social_links?.twitter || ""}
                onChange={(e) => setContent({
                  ...content,
                  social_links: { ...content.social_links, twitter: e.target.value },
                })}
                placeholder="Twitter URL"
              />
              <Input
                value={content.social_links?.email || ""}
                onChange={(e) => setContent({
                  ...content,
                  social_links: { ...content.social_links, email: e.target.value },
                })}
                placeholder="Email"
              />
            </div>
          </div>
        </div>
      )}

      {component.component_type === "skills_cloud" && (
        <div className="space-y-4">
          <div>
            <Label>Display Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={content.display_mode === "cloud" ? "default" : "outline"}
                size="sm"
                onClick={() => setContent({ ...content, display_mode: "cloud" })}
              >
                Cloud
              </Button>
              <Button
                variant={content.display_mode === "bars" ? "default" : "outline"}
                size="sm"
                onClick={() => setContent({ ...content, display_mode: "bars" })}
              >
                Bars
              </Button>
            </div>
          </div>
        <div>
          <Label>Skills (comma-separated)</Label>
          <Textarea
            value={Array.isArray(content.skills) ? content.skills.join(", ") : ""}
            onChange={(e) =>
              setContent({
                ...content,
                  skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            rows={4}
            placeholder="e.g., JavaScript, React, Node.js"
          />
          </div>
        </div>
      )}

      {component.component_type === "experience_timeline" && (
        <div className="space-y-4">
          <div>
            <Label>Experiences</Label>
            <div className="space-y-2">
              {(content.experiences || []).map((exp: any, idx: number) => (
                <Card key={idx} className="p-3">
                  <div className="space-y-2">
            <Input
                      value={exp.title || ""}
                      onChange={(e) => {
                        const newExps = [...(content.experiences || [])];
                        newExps[idx] = { ...exp, title: e.target.value };
                        setContent({ ...content, experiences: newExps });
                      }}
                      placeholder="Job Title"
                    />
                    <Input
                      value={exp.company || ""}
                      onChange={(e) => {
                        const newExps = [...(content.experiences || [])];
                        newExps[idx] = { ...exp, company: e.target.value };
                        setContent({ ...content, experiences: newExps });
                      }}
                      placeholder="Company"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={exp.start_date || ""}
                        onChange={(e) => {
                          const newExps = [...(content.experiences || [])];
                          newExps[idx] = { ...exp, start_date: e.target.value };
                          setContent({ ...content, experiences: newExps });
                        }}
                        placeholder="Start Date"
                      />
                      <Input
                        value={exp.end_date || ""}
                        onChange={(e) => {
                          const newExps = [...(content.experiences || [])];
                          newExps[idx] = { ...exp, end_date: e.target.value };
                          setContent({ ...content, experiences: newExps });
                        }}
                        placeholder="End Date"
                      />
                    </div>
                    <Textarea
                      value={exp.description || ""}
                      onChange={(e) => {
                        const newExps = [...(content.experiences || [])];
                        newExps[idx] = { ...exp, description: e.target.value };
                        setContent({ ...content, experiences: newExps });
                      }}
                      placeholder="Description"
                      rows={2}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newExps = (content.experiences || []).filter((_: any, i: number) => i !== idx);
                        setContent({ ...content, experiences: newExps });
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setContent({
                    ...content,
                    experiences: [...(content.experiences || []), { title: "", company: "", start_date: "", end_date: "", description: "" }],
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </div>
          </div>
        </div>
      )}

      {component.component_type === "project_grid" && (
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableProjects.map((project) => {
              const isSelected = (content.projects || []).some(
                (p: any) => p.id === project.id
              );
              return (
                <Card
                  key={project.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    const currentProjects = content.projects || [];
                    if (isSelected) {
                      setContent({
                        ...content,
                        projects: currentProjects.filter((p: any) => p.id !== project.id),
                      });
                    } else {
                      setContent({
                        ...content,
                        projects: [...currentProjects, project],
                      });
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{project.title}</div>
                      {project.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <div>
            <Label>Show Filters</Label>
            <Switch
              checked={content.show_filters !== false}
              onCheckedChange={(checked) => setContent({ ...content, show_filters: checked })}
            />
          </div>
        </div>
      )}

      {component.component_type === "services_section" && (
        <div className="space-y-4">
          <div>
            <Label>Services</Label>
            <div className="space-y-2">
              {(content.services || []).map((service: any, idx: number) => (
                <Card key={idx} className="p-3">
                  <div className="space-y-2">
            <Input
                      value={service.title || ""}
                      onChange={(e) => {
                        const newServices = [...(content.services || [])];
                        newServices[idx] = { ...service, title: e.target.value };
                        setContent({ ...content, services: newServices });
                      }}
                      placeholder="Service Title"
                    />
                    <Textarea
                      value={service.description || ""}
                      onChange={(e) => {
                        const newServices = [...(content.services || [])];
                        newServices[idx] = { ...service, description: e.target.value };
                        setContent({ ...content, services: newServices });
                      }}
                      placeholder="Service Description"
                      rows={2}
                    />
                    <Input
                      value={service.icon || ""}
                      onChange={(e) => {
                        const newServices = [...(content.services || [])];
                        newServices[idx] = { ...service, icon: e.target.value };
                        setContent({ ...content, services: newServices });
                      }}
                      placeholder="Icon name or URL"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newServices = (content.services || []).filter((_: any, i: number) => i !== idx);
                        setContent({ ...content, services: newServices });
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
          </div>
                </Card>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setContent({
                    ...content,
                    services: [...(content.services || []), { title: "", description: "", icon: "" }],
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>
        </div>
      )}

      {component.component_type === "achievements_counters" && (
        <div className="space-y-4">
          <div>
            <Label>Achievement Counters</Label>
            <div className="space-y-2">
              {(content.counters || []).map((counter: any, idx: number) => (
                <Card key={idx} className="p-3">
                  <div className="space-y-2">
                    <Input
                      value={counter.label || ""}
                      onChange={(e) => {
                        const newCounters = [...(content.counters || [])];
                        newCounters[idx] = { ...counter, label: e.target.value };
                        setContent({ ...content, counters: newCounters });
                      }}
                      placeholder="Label (e.g., Projects Completed)"
                    />
                    <Input
                      type="number"
                      value={counter.value || 0}
                      onChange={(e) => {
                        const newCounters = [...(content.counters || [])];
                        newCounters[idx] = { ...counter, value: parseInt(e.target.value) || 0 };
                        setContent({ ...content, counters: newCounters });
                      }}
                      placeholder="Target Value"
                    />
                    <Input
                      value={counter.suffix || ""}
                      onChange={(e) => {
                        const newCounters = [...(content.counters || [])];
                        newCounters[idx] = { ...counter, suffix: e.target.value };
                        setContent({ ...content, counters: newCounters });
                      }}
                      placeholder="Suffix (e.g., +, %, etc.)"
                    />
                    <Input
                      value={counter.icon || ""}
                      onChange={(e) => {
                        const newCounters = [...(content.counters || [])];
                        newCounters[idx] = { ...counter, icon: e.target.value };
                        setContent({ ...content, counters: newCounters });
                      }}
                      placeholder="Icon name or URL"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newCounters = (content.counters || []).filter((_: any, i: number) => i !== idx);
                        setContent({ ...content, counters: newCounters });
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setContent({
                    ...content,
                    counters: [...(content.counters || []), { label: "", value: 0, suffix: "", icon: "" }],
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Counter
              </Button>
            </div>
          </div>
        </div>
      )}

      {component.component_type === "testimonials_carousel" && (
        <div className="space-y-4">
          <div>
            <Label>Testimonials</Label>
            <div className="space-y-2">
              {(content.testimonials || []).map((testimonial: any, idx: number) => (
                <Card key={idx} className="p-3">
                  <div className="space-y-2">
                    <Textarea
                      value={testimonial.quote || ""}
                      onChange={(e) => {
                        const newTestimonials = [...(content.testimonials || [])];
                        newTestimonials[idx] = { ...testimonial, quote: e.target.value };
                        setContent({ ...content, testimonials: newTestimonials });
                      }}
                      placeholder="Testimonial quote"
                      rows={3}
                    />
                    <Input
                      value={testimonial.author || ""}
                      onChange={(e) => {
                        const newTestimonials = [...(content.testimonials || [])];
                        newTestimonials[idx] = { ...testimonial, author: e.target.value };
                        setContent({ ...content, testimonials: newTestimonials });
                      }}
                      placeholder="Author Name"
                    />
                    <Input
                      value={testimonial.role || ""}
                      onChange={(e) => {
                        const newTestimonials = [...(content.testimonials || [])];
                        newTestimonials[idx] = { ...testimonial, role: e.target.value };
                        setContent({ ...content, testimonials: newTestimonials });
                      }}
                      placeholder="Author Role/Company"
                    />
                    <Input
                      value={testimonial.avatar || ""}
                      onChange={(e) => {
                        const newTestimonials = [...(content.testimonials || [])];
                        newTestimonials[idx] = { ...testimonial, avatar: e.target.value };
                        setContent({ ...content, testimonials: newTestimonials });
                      }}
                      placeholder="Avatar URL"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newTestimonials = (content.testimonials || []).filter((_: any, i: number) => i !== idx);
                        setContent({ ...content, testimonials: newTestimonials });
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setContent({
                    ...content,
                    testimonials: [...(content.testimonials || []), { quote: "", author: "", role: "", avatar: "" }],
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </div>
          </div>
        </div>
      )}

      {component.component_type === "blog_preview_grid" && (
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableBlogPosts.map((post) => {
              const isSelected = (content.posts || []).some(
                (p: any) => p.id === post.id
              );
              return (
                <Card
                  key={post.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    const currentPosts = content.posts || [];
                    if (isSelected) {
                      setContent({
                        ...content,
                        posts: currentPosts.filter((p: any) => p.id !== post.id),
                      });
                    } else {
                      setContent({
                        ...content,
                        posts: [...currentPosts, post],
                      });
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {post.excerpt}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <div>
            <Label>Posts Per Row</Label>
            <Input
              type="number"
              min="1"
              max="4"
              value={content.posts_per_row || 3}
              onChange={(e) => setContent({ ...content, posts_per_row: parseInt(e.target.value) || 3 })}
            />
          </div>
        </div>
      )}

      {component.component_type === "contact_form" && (
        <div className="space-y-4">
          <div>
            <Label>Form Title</Label>
            <Input
              value={content.title || "Contact Info"}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Submit Button Text</Label>
            <Input
              value={content.submit_button_text || "Send Message"}
              onChange={(e) => setContent({ ...content, submit_button_text: e.target.value })}
            />
          </div>
          <div>
            <Label>Form Fields</Label>
            <div className="space-y-2">
              {["name", "email", "phone", "message", "subject"].map((field) => {
                const isEnabled = (content.fields || []).includes(field);
                return (
                  <div key={field} className="flex items-center justify-between p-2 border rounded">
                    <Label className="capitalize">{field}</Label>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => {
                        const currentFields = content.fields || [];
                        if (checked) {
                          setContent({ ...content, fields: [...currentFields, field] });
                        } else {
                          setContent({ ...content, fields: currentFields.filter((f: string) => f !== field) });
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Label className="text-base font-semibold mb-3 block">Contact Information</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Display contact details above or below the form
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={content.contact_info?.email || ""}
                  onChange={(e) => setContent({ 
                    ...content, 
                    contact_info: { 
                      ...(content.contact_info || {}), 
                      email: e.target.value 
                    } 
                  })}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={content.contact_info?.phone || ""}
                  onChange={(e) => setContent({ 
                    ...content, 
                    contact_info: { 
                      ...(content.contact_info || {}), 
                      phone: e.target.value 
                    } 
                  })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="contact-location">Location</Label>
                <Input
                  id="contact-location"
                  type="text"
                  value={content.contact_info?.location || ""}
                  onChange={(e) => setContent({ 
                    ...content, 
                    contact_info: { 
                      ...(content.contact_info || {}), 
                      location: e.target.value 
                    } 
                  })}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="contact-linkedin">LinkedIn</Label>
                <Input
                  id="contact-linkedin"
                  type="url"
                  value={content.contact_info?.linkedin || ""}
                  onChange={(e) => setContent({ 
                    ...content, 
                    contact_info: { 
                      ...(content.contact_info || {}), 
                      linkedin: e.target.value 
                    } 
                  })}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <Label htmlFor="contact-github">GitHub</Label>
                <Input
                  id="contact-github"
                  type="url"
                  value={content.contact_info?.github || ""}
                  onChange={(e) => setContent({ 
                    ...content, 
                    contact_info: { 
                      ...(content.contact_info || {}), 
                      github: e.target.value 
                    } 
                  })}
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <Label htmlFor="contact-website">Website</Label>
                <Input
                  id="contact-website"
                  type="url"
                  value={content.contact_info?.website || ""}
                  onChange={(e) => setContent({ 
                    ...content, 
                    contact_info: { 
                      ...(content.contact_info || {}), 
                      website: e.target.value 
                    } 
                  })}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {component.component_type === "footer" && (
        <div className="space-y-4">
          <div>
            <Label>Copyright Text</Label>
            <Input
              value={content.copyright_text || ""}
              onChange={(e) => setContent({ ...content, copyright_text: e.target.value })}
              placeholder="© 2024 Your Name. All rights reserved."
            />
          </div>
          <div>
            <Label>Social Links</Label>
            <div className="space-y-2">
              <Input
                value={content.social_links?.linkedin || ""}
                onChange={(e) => setContent({
                  ...content,
                  social_links: { ...content.social_links, linkedin: e.target.value },
                })}
                placeholder="LinkedIn URL"
              />
              <Input
                value={content.social_links?.github || ""}
                onChange={(e) => setContent({
                  ...content,
                  social_links: { ...content.social_links, github: e.target.value },
                })}
                placeholder="GitHub URL"
              />
              <Input
                value={content.social_links?.twitter || ""}
                onChange={(e) => setContent({
                  ...content,
                  social_links: { ...content.social_links, twitter: e.target.value },
                })}
                placeholder="Twitter URL"
              />
            </div>
          </div>
          <div>
            <Label>Footer Links</Label>
            <div className="space-y-2">
              {(content.links || []).map((link: any, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={link.text || ""}
                    onChange={(e) => {
                      const newLinks = [...(content.links || [])];
                      newLinks[idx] = { ...link, text: e.target.value };
                      setContent({ ...content, links: newLinks });
                    }}
                    placeholder="Link text"
                  />
                  <Input
                    value={link.url || ""}
                    onChange={(e) => {
                      const newLinks = [...(content.links || [])];
                      newLinks[idx] = { ...link, url: e.target.value };
                      setContent({ ...content, links: newLinks });
                    }}
                    placeholder="URL"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newLinks = (content.links || []).filter((_: any, i: number) => i !== idx);
                      setContent({ ...content, links: newLinks });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setContent({
                    ...content,
                    links: [...(content.links || []), { text: "", url: "" }],
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
        </div>
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
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.6 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  const componentType = COMPONENT_TYPES.find(t => t.value === component.component_type);
  const Icon = componentType?.icon || FileText;
  const componentColor = componentType?.color || "bg-gray-500/10 text-gray-500 border-gray-500/20";

  const getContentPreview = () => {
    switch (component.component_type) {
      case "hero_banner":
        return component.content.title || "Hero Banner";
      case "about_me_card":
        return component.content.name || component.content.title || "About Me";
      case "skills_cloud": {
        const skillCount = Array.isArray(component.content.skills) ? component.content.skills.length : 0;
        return skillCount > 0
          ? `${skillCount} skill${skillCount !== 1 ? "s" : ""} (${component.content.display_mode || "cloud"})`
          : "Add skills";
      }
      case "experience_timeline":
        return Array.isArray(component.content.experiences) && component.content.experiences.length > 0
          ? `${component.content.experiences.length} experience${component.content.experiences.length !== 1 ? "s" : ""}`
          : "Add experiences";
      case "project_grid":
        return Array.isArray(component.content.projects) && component.content.projects.length > 0
          ? `${component.content.projects.length} project${component.content.projects.length !== 1 ? "s" : ""}`
          : "Select projects";
      case "services_section":
        return Array.isArray(component.content.services) && component.content.services.length > 0
          ? `${component.content.services.length} service${component.content.services.length !== 1 ? "s" : ""}`
          : "Add services";
      case "achievements_counters":
        return Array.isArray(component.content.counters) && component.content.counters.length > 0
          ? `${component.content.counters.length} counter${component.content.counters.length !== 1 ? "s" : ""}`
          : "Add counters";
      case "testimonials_carousel":
        return Array.isArray(component.content.testimonials) && component.content.testimonials.length > 0
          ? `${component.content.testimonials.length} testimonial${component.content.testimonials.length !== 1 ? "s" : ""}`
          : "Add testimonials";
      case "blog_preview_grid":
        return Array.isArray(component.content.posts) && component.content.posts.length > 0
          ? `${component.content.posts.length} post${component.content.posts.length !== 1 ? "s" : ""}`
          : "Select blog posts";
      case "contact_form":
        return component.content.title || "Contact Form";
      case "footer":
        return component.content.copyright_text || "Footer";
      default:
        return "Configure component";
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-lg transition-all duration-200 hover:shadow-md hover:border-primary/50 border ${!component.is_visible ? "opacity-60 border-dashed bg-muted/30" : "border-solid shadow-sm"} ${isDragging ? "ring-2 ring-primary ring-offset-2 shadow-lg z-50" : ""} group`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded-lg transition-all duration-200 mt-1 group-hover:bg-primary/10"
          title="Drag to reorder"
          >
          <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

        {/* Component icon and info */}
        <div className={`p-3 rounded-xl ${componentColor} flex-shrink-0 border-2`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Component details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-semibold capitalize text-base">{component.component_type}</h3>
              {!component.is_visible && (
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-medium flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  Hidden
                </span>
              )}
              {component.is_visible && (
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs font-medium flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Visible
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onEdit}
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                title="Edit component"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onDelete}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                title="Delete component"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
          </div>
        </div>
          
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {getContentPreview()}
          </p>

          <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={component.is_visible}
              onCheckedChange={onToggleVisibility}
                className="scale-90"
            />
            <span className="text-xs text-muted-foreground">
              {component.is_visible ? "Visible" : "Hidden"}
            </span>
          </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpDown className="w-3 h-3" />
              <span>Order: {component.order + 1}</span>
        </div>
      </div>
        </div>
      </div>
    </Card>
  );
};

export default PortfolioBuilder;

