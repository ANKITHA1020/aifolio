import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { blogApi } from "@/lib/api";
import { Switch } from "@/components/ui/switch";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content_markdown: string;
  excerpt: string;
  featured_image: string | null;
  category: { id: number; name: string } | null;
  tags: Array<{ id: number; name: string }>;
  published: boolean;
  published_date: string | null;
  views: number;
  created_at: string;
  updated_at: string;
}

const BlogPosts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [aiTopic, setAiTopic] = useState("");
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [improvingContent, setImprovingContent] = useState(false);
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false);
  const [blogOutline, setBlogOutline] = useState<any>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content_markdown: "",
    excerpt: "",
    featured_image: null as File | null,
    category: "",
    tag_names: "",
    published: false,
  });

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getBlogPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await blogApi.getBlogCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleCreate = () => {
    setEditingPost(null);
    setAiTopic("");
    setBlogOutline(null);
    setShowAIPanel(false);
    setFormData({
      title: "",
      content_markdown: "",
      excerpt: "",
      featured_image: null,
      category: "",
      tag_names: "",
      published: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setAiTopic("");
    setBlogOutline(null);
    setShowAIPanel(false);
    setFormData({
      title: post.title,
      content_markdown: post.content_markdown,
      excerpt: post.excerpt || "",
      featured_image: null,
      category: post.category?.id.toString() || "",
      tag_names: post.tags.map((t) => t.name).join(", "),
      published: post.published,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content_markdown.trim()) {
      toast({
        title: "Error",
        description: "Content is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const data = {
        ...formData,
        category: formData.category ? parseInt(formData.category) : undefined,
        tag_names: formData.tag_names
          ? formData.tag_names.split(",").map((t) => t.trim())
          : [],
        featured_image: formData.featured_image || undefined,
      };

      if (editingPost) {
        await blogApi.updateBlogPost(editingPost.id, data);
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        await blogApi.createBlogPost(data);
        toast({
          title: "Success",
          description: "Blog post created successfully",
        });
      }

      setIsDialogOpen(false);
      await loadPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save blog post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      await blogApi.deleteBlogPost(id);
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      await loadPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden bg-professional-image">
      {/* Professional Background Overlay */}
      <div className="bg-overlay-light"></div>
      
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 relative z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>

        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No blog posts found</p>
            <Button className="mt-4" onClick={handleCreate}>
              Create Your First Post
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{post.title}</h3>
                      {post.published ? (
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                    </div>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span>{post.views} views</span>
                      {post.category && <span>{post.category.name}</span>}
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-muted rounded text-xs"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post)}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
            </DialogTitle>
            <DialogDescription>
              {editingPost
                ? "Update your blog post"
                : "Write a new blog post"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Blog Post Title"
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Short excerpt for preview (max 500 characters)"
                rows={3}
                maxLength={500}
              />
            </div>

            <div>
              <Label htmlFor="content_markdown">Content (Markdown) *</Label>
              <Textarea
                id="content_markdown"
                value={formData.content_markdown}
                onChange={(e) =>
                  setFormData({ ...formData, content_markdown: e.target.value })
                }
                placeholder="# Your Blog Post Content

Write your blog post in Markdown format..."
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supports Markdown formatting
              </p>
            </div>

            <div>
              <Label htmlFor="featured_image">Featured Image</Label>
              <Input
                id="featured_image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    featured_image: e.target.files?.[0] || null,
                  })
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="tag_names">Tags (comma-separated)</Label>
              <Input
                id="tag_names"
                value={formData.tag_names}
                onChange={(e) =>
                  setFormData({ ...formData, tag_names: e.target.value })
                }
                placeholder="e.g., technology, programming, web development"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, published: checked })
                }
              />
              <Label>Publish Post</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogPosts;

