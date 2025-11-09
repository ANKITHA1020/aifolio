import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Wand2,
  Copy,
  Check,
  Loader2,
  Sparkles,
  FileText,
  Type,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiApi } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GenerateContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // State for Bio Generation
  const [bioResumeData, setBioResumeData] = useState<any>(null);
  const [generatedBio, setGeneratedBio] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);
  const [bioCopied, setBioCopied] = useState(false);

  // State for Project Description
  const [projectTitle, setProjectTitle] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [projectSkills, setProjectSkills] = useState("");
  const [generatedProjectDesc, setGeneratedProjectDesc] = useState("");
  const [generatingProjectDesc, setGeneratingProjectDesc] = useState(false);
  const [projectDescCopied, setProjectDescCopied] = useState(false);

  // State for Text Improvement
  const [inputText, setInputText] = useState("");
  const [improvedText, setImprovedText] = useState("");
  const [improvingText, setImprovingText] = useState(false);
  const [improvedTextCopied, setImprovedTextCopied] = useState(false);
  const [improvementTone, setImprovementTone] = useState("professional");
  const [improvementPurpose, setImprovementPurpose] = useState("portfolio");
  const [improveGrammar, setImproveGrammar] = useState(true);
  const [improveSEO, setImproveSEO] = useState(false);

  useEffect(() => {
    // Get extracted data from navigation state
    if (location.state?.extractedData) {
      setBioResumeData(location.state.extractedData.structured_data);
    }
  }, [location]);

  const handleGenerateBio = async () => {
    if (!bioResumeData) {
      toast({
        title: "Error",
        description: "No resume data available. Please upload and parse a resume first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingBio(true);
      const response = await aiApi.generateBio(bioResumeData);
      setGeneratedBio(response.bio);
      toast({
        title: "Success",
        description: "Bio generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate bio",
        variant: "destructive",
      });
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleGenerateProjectDescription = async () => {
    if (!projectTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project title",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingProjectDesc(true);
      const techArray = technologies
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      const skillsArray = projectSkills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await aiApi.generateProjectDescription({
        title: projectTitle,
        technologies: techArray.length > 0 ? techArray : undefined,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
      });
      setGeneratedProjectDesc(response.description);
      toast({
        title: "Success",
        description: "Project description generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate project description",
        variant: "destructive",
      });
    } finally {
      setGeneratingProjectDesc(false);
    }
  };

  const handleImproveText = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to improve",
        variant: "destructive",
      });
      return;
    }

    try {
      setImprovingText(true);
      const response = await aiApi.improveText({
        text: inputText,
        tone: improvementTone,
        purpose: improvementPurpose,
        improve_grammar: improveGrammar,
        improve_seo: improveSEO,
      });
      setImprovedText(response.improved_text);
      toast({
        title: "Success",
        description: "Text improved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to improve text",
        variant: "destructive",
      });
    } finally {
      setImprovingText(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: (value: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Generate Content</h1>
          </div>
          <p className="text-muted-foreground">
            Use AI to generate professional bios, project descriptions, and improve your text
          </p>
        </div>

        <Tabs defaultValue="bio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bio">Generate Bio</TabsTrigger>
            <TabsTrigger value="project">Project Description</TabsTrigger>
            <TabsTrigger value="improve">Improve Text</TabsTrigger>
          </TabsList>

          {/* Bio Generation Tab */}
          <TabsContent value="bio" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Generate Professional Bio</h2>
              </div>
              
              {bioResumeData ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Resume Data Available:</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {bioResumeData.name && <p>Name: {bioResumeData.name}</p>}
                      {bioResumeData.summary && <p>Summary: {bioResumeData.summary}</p>}
                      {bioResumeData.skills && (
                        <p>Skills: {bioResumeData.skills.join(", ")}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateBio}
                    disabled={generatingBio}
                    className="w-full"
                  >
                    {generatingBio ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Bio
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No resume data available</p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => navigate("/upload-resume")}
                  >
                    Upload and Parse Resume First
                  </Button>
                </div>
              )}

              {generatedBio && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Generated Bio</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedBio, setBioCopied)}
                    >
                      {bioCopied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={generatedBio}
                    onChange={(e) => setGeneratedBio(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Project Description Tab */}
          <TabsContent value="project" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Generate Project Description</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-title">Project Title *</Label>
                  <Input
                    id="project-title"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g., E-commerce Platform"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                  <Input
                    id="technologies"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="e.g., React, Node.js, PostgreSQL"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="skills">Skills Demonstrated (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={projectSkills}
                    onChange={(e) => setProjectSkills(e.target.value)}
                    placeholder="e.g., Full-stack development, API design"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleGenerateProjectDescription}
                  disabled={generatingProjectDesc || !projectTitle.trim()}
                  className="w-full"
                >
                  {generatingProjectDesc ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Description
                    </>
                  )}
                </Button>
              </div>

              {generatedProjectDesc && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Generated Description</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(generatedProjectDesc, setProjectDescCopied)
                      }
                    >
                      {projectDescCopied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={generatedProjectDesc}
                    onChange={(e) => setGeneratedProjectDesc(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Text Improvement Tab */}
          <TabsContent value="improve" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Improve Text</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="input-text">Text to Improve *</Label>
                  <Textarea
                    id="input-text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter the text you want to improve..."
                    rows={6}
                    className="mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <select
                      id="tone"
                      value={improvementTone}
                      onChange={(e) => setImprovementTone(e.target.value)}
                      className="w-full mt-2 px-3 py-2 rounded-md border border-input bg-background"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="friendly">Friendly</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Purpose</Label>
                    <select
                      id="purpose"
                      value={improvementPurpose}
                      onChange={(e) => setImprovementPurpose(e.target.value)}
                      className="w-full mt-2 px-3 py-2 rounded-md border border-input bg-background"
                    >
                      <option value="portfolio">Portfolio</option>
                      <option value="blog">Blog</option>
                      <option value="resume">Resume</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={improveGrammar}
                      onChange={(e) => setImproveGrammar(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Improve Grammar</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={improveSEO}
                      onChange={(e) => setImproveSEO(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Optimize for SEO</span>
                  </label>
                </div>

                <Button
                  onClick={handleImproveText}
                  disabled={improvingText || !inputText.trim()}
                  className="w-full"
                >
                  {improvingText ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Improving...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Improve Text
                    </>
                  )}
                </Button>
              </div>

              {improvedText && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Improved Text</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(improvedText, setImprovedTextCopied)}
                    >
                      {improvedTextCopied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={improvedText}
                    onChange={(e) => setImprovedText(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GenerateContent;

