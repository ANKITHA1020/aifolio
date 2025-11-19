import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Wand2, Trash2, FileText, Loader2, Sparkles, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resumeApi, aiApi } from "@/lib/api";
import FileUpload from "@/components/FileUpload";

interface Resume {
  id: number;
  file: string;
  uploaded_at: string;
  status: string;
  extracted_data?: any;
}

const UploadResume = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState<number | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [loadingExtractedData, setLoadingExtractedData] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [generatedBio, setGeneratedBio] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await resumeApi.getResumes();
      // Handle paginated response (DRF returns { results: [...] }) or direct array
      const resumesArray = Array.isArray(data) 
        ? data 
        : (data?.results || []);
      
      // Sort resumes by upload date (newest first)
      const sortedResumes = [...resumesArray].sort((a, b) => {
        const dateA = new Date(a.uploaded_at).getTime();
        const dateB = new Date(b.uploaded_at).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      
      setResumes(sortedResumes);
      
      // If a resume was selected, update it with latest data
      if (selectedResume) {
        const updatedResume = sortedResumes.find(r => r.id === selectedResume.id);
        if (updatedResume) {
          setSelectedResume(updatedResume);
          if (updatedResume.extracted_data) {
            setExtractedData(updatedResume.extracted_data);
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load resumes",
        variant: "destructive",
      });
      setResumes([]); // Ensure it's always an array on error
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setUploading(true);
      const uploaded = await resumeApi.uploadResume(file);
      toast({
        title: "Success",
        description: "Resume uploaded successfully",
      });
      await loadResumes();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload resume",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSelectResume = async (resume: Resume) => {
    setSelectedResume(resume);
    
    // If resume has extracted_data already, use it
    if (resume.extracted_data) {
      setExtractedData(resume.extracted_data);
      return;
    }
    
    // If resume is completed but extracted_data not loaded, fetch it
    if (resume.status === "completed") {
      try {
        setLoadingExtractedData(true);
        const fullResume = await resumeApi.getResume(resume.id);
        if (fullResume.extracted_data) {
          setExtractedData(fullResume.extracted_data);
          // Update the resume in the list with extracted_data
          const resumesArray = Array.isArray(resumes) ? resumes : [];
          const updatedResumes = resumesArray.map((r) =>
            r.id === resume.id ? { ...r, extracted_data: fullResume.extracted_data } : r
          );
          setResumes(updatedResumes);
        } else {
          setExtractedData(null);
        }
      } catch (error: any) {
        console.error("Failed to load extracted data:", error);
        setExtractedData(null);
      } finally {
        setLoadingExtractedData(false);
      }
    } else {
      setExtractedData(null);
    }
  };

  const handleParseResume = async (resumeId: number) => {
    try {
      setParsing(resumeId);
      const result = await resumeApi.parseResume(resumeId);
      
      // Format the result to match extracted_data structure
      const extractedDataFormatted = {
        structured_data: result.structured_data,
        skills: result.skills || [],
      };
      
      setExtractedData(extractedDataFormatted);
      
      // Update the resume in the list - ensure resumes is an array
      const resumesArray = Array.isArray(resumes) ? resumes : [];
      const updatedResumes = resumesArray.map((r) =>
        r.id === resumeId ? { ...r, status: "completed", extracted_data: extractedDataFormatted } : r
      );
      setResumes(updatedResumes);
      const updatedResume = updatedResumes.find((r) => r.id === resumeId);
      if (updatedResume) {
        setSelectedResume(updatedResume);
      }

      toast({
        title: "Success",
        description: "Resume parsed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Parse failed",
        description: error.message || "Failed to parse resume",
        variant: "destructive",
      });
    } finally {
      setParsing(null);
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    if (!confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    try {
      await resumeApi.deleteResume(resumeId);
      toast({
        title: "Success",
        description: "Resume deleted successfully",
      });
      await loadResumes();
      // Clear selection if deleted resume was selected
      if (selectedResume?.id === resumeId) {
        setSelectedResume(null);
        setExtractedData(null);
        setGeneratedBio(null);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete resume",
        variant: "destructive",
      });
    }
  };

  const handleGenerateBio = async () => {
    if (!extractedData?.structured_data) {
      toast({
        title: "No Resume Data",
        description: "Please parse a resume first to generate bio",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingBio(true);
      setGeneratedBio(null);
      const response = await aiApi.generateBio(extractedData.structured_data);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500" },
      processing: { label: "Processing", className: "bg-blue-500/10 text-blue-500" },
      completed: { label: "Completed", className: "bg-green-500/10 text-green-500" },
      failed: { label: "Failed", className: "bg-red-500/10 text-red-500" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden bg-professional-image">
      {/* Professional Background Overlay */}
      <div className="bg-overlay-light"></div>
      
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 relative z-50">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Upload Resume</h1>
          <p className="text-muted-foreground">
            Upload your resume and let AI extract your information automatically
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upload New Resume</h2>
              <FileUpload
                onFileSelect={handleFileSelect}
                disabled={uploading}
                acceptedTypes={[".pdf", ".doc", ".docx"]}
                maxSize={10 * 1024 * 1024}
              />
              {uploading && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Uploading...
                </div>
              )}
            </Card>

            {/* Resume List */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Resumes</h2>
                {resumes.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {resumes.length} {resumes.length === 1 ? "resume" : "resumes"}
                  </span>
                )}
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : !Array.isArray(resumes) || resumes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No resumes uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                  {resumes.map((resume, index) => (
                    <Card
                      key={resume.id}
                      className={`p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${
                        selectedResume?.id === resume.id
                          ? "border-2 border-primary bg-primary/10 shadow-md"
                          : "border"
                      }`}
                      onClick={() => handleSelectResume(resume)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectResume(resume);
                        }
                      }}
                      aria-label={`Select resume ${resume.file.split("/").pop()}`}
                      aria-pressed={selectedResume?.id === resume.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className={`w-4 h-4 flex-shrink-0 ${
                              selectedResume?.id === resume.id ? "text-primary" : "text-muted-foreground"
                            }`} />
                            <p className={`text-sm font-medium truncate ${
                              selectedResume?.id === resume.id ? "text-primary font-semibold" : ""
                            }`}>
                              {resume.file.split("/").pop()}
                            </p>
                            {selectedResume?.id === resume.id && (
                              <span className="text-xs text-primary font-medium">(Selected)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(resume.status)}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(resume.uploaded_at)}
                            </span>
                            {resume.status === "completed" && resume.extracted_data && (
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Parsed
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleParseResume(resume.id);
                            }}
                            disabled={parsing === resume.id || resume.status === "processing"}
                          >
                            {parsing === resume.id ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                Parsing...
                              </>
                            ) : resume.status === "completed" ? (
                              <>
                                <Wand2 className="w-3 h-3 mr-2" />
                                Re-parse
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-3 h-3 mr-2" />
                                Extract
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResume(resume.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Extracted Data Display */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Extracted Information</h2>
                {selectedResume && (
                  <span className="text-sm text-muted-foreground">
                    {selectedResume.file.split("/").pop()}
                  </span>
                )}
              </div>
              {loadingExtractedData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Loading extracted data...</span>
                </div>
              ) : selectedResume ? (
                extractedData ? (
                  <div className="space-y-4">
                    {extractedData.structured_data && (
                      <div className="space-y-3">
                        {extractedData.structured_data.name && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-base">{extractedData.structured_data.name}</p>
                          </div>
                        )}
                        {extractedData.structured_data.email && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p className="text-base">{extractedData.structured_data.email}</p>
                          </div>
                        )}
                        {extractedData.structured_data.phone && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                            <p className="text-base">{extractedData.structured_data.phone}</p>
                          </div>
                        )}
                        {extractedData.structured_data.summary && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Summary</p>
                            <p className="text-base">{extractedData.structured_data.summary}</p>
                          </div>
                        )}
                        {extractedData.structured_data.experience &&
                          extractedData.structured_data.experience.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                Experience
                              </p>
                              <div className="space-y-2">
                                {extractedData.structured_data.experience.map(
                                  (exp: any, idx: number) => (
                                    <Card key={idx} className="p-3">
                                      <p className="font-medium">{exp.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {exp.company} • {exp.start_date} - {exp.end_date || "Present"}
                                      </p>
                                      {exp.description && (
                                        <p className="text-sm mt-1">{exp.description}</p>
                                      )}
                                    </Card>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {extractedData.structured_data.skills &&
                          extractedData.structured_data.skills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                Skills
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {extractedData.structured_data.skills.map(
                                  (skill: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {extractedData.structured_data.certifications &&
                          extractedData.structured_data.certifications.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                Certifications
                              </p>
                              <div className="space-y-2">
                                {extractedData.structured_data.certifications.map(
                                  (cert: any, idx: number) => (
                                    <Card key={idx} className="p-3">
                                      <p className="font-medium">{cert.name || cert}</p>
                                      {cert.issuer && (
                                        <p className="text-sm text-muted-foreground">
                                          {cert.issuer}
                                        </p>
                                      )}
                                      {cert.date && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {cert.date}
                                          {cert.expiry && ` - Expires: ${cert.expiry}`}
                                        </p>
                                      )}
                                    </Card>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {extractedData.structured_data.education &&
                          extractedData.structured_data.education.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                Education
                              </p>
                              <div className="space-y-2">
                                {extractedData.structured_data.education.map(
                                  (edu: any, idx: number) => (
                                    <Card key={idx} className="p-3">
                                      <p className="font-medium">{edu.degree}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {edu.institution}
                                        {edu.year && ` • ${edu.year}`}
                                      </p>
                                    </Card>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {extractedData.skills && extractedData.skills.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Categorized Skills
                            </p>
                            <div className="space-y-3">
                              {['technical', 'framework', 'tool', 'soft', 'language', 'other'].map(
                                (category) => {
                                  const categorySkills = extractedData.skills.filter(
                                    (skill: any) => skill.category === category
                                  );
                                  if (categorySkills.length === 0) return null;
                                  return (
                                    <div key={category}>
                                      <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                                        {category} Skills
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {categorySkills.map((skill: any, idx: number) => (
                                          <span
                                            key={idx}
                                            className="px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                                            title={`Confidence: ${(skill.confidence * 100).toFixed(0)}%`}
                                          >
                                            {skill.name}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="pt-4 border-t space-y-3">
                      <Button
                        onClick={() => navigate("/generate-content", { state: { extractedData } })}
                        className="w-full"
                      >
                        Use This Data to Generate Content
                      </Button>
                      
                      {/* Generate Bio Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Generate Bio</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateBio}
                            disabled={generatingBio}
                            className="gap-2"
                          >
                            {generatingBio ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Generate Bio
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {generatedBio && (
                          <Card className="p-4 bg-primary/5 border-primary/20">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Generated Bio</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setGeneratedBio(null)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <Textarea
                                value={generatedBio}
                                onChange={(e) => setGeneratedBio(e.target.value)}
                                className="min-h-[150px]"
                                placeholder="Generated bio will appear here..."
                              />
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(generatedBio);
                                    toast({
                                      title: "Copied",
                                      description: "Bio copied to clipboard",
                                    });
                                  }}
                                  className="flex-1"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Copy Bio
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                ) : selectedResume.status === "completed" ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No extracted data available</p>
                    <Button
                      className="mt-4"
                      onClick={() => handleParseResume(selectedResume.id)}
                    >
                      Parse Resume Again
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Click "Extract" to parse this resume</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a resume to view extracted information</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;

