import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Download,
  FileText,
  FileDown,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportApi, portfolioApi } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

const Export = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);
  const [exportType] = useState<"html">("html");
  const [exporting, setExporting] = useState(false);
  const [exportJob, setExportJob] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadPortfolios();
  }, []);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoadingPortfolios(true);
      const data = await portfolioApi.getPortfolios();
      // Handle paginated responses
      const portfoliosArray = Array.isArray(data) 
        ? data 
        : (data?.results || data?.data || []);
      setPortfolios(portfoliosArray);
      if (portfoliosArray.length > 0 && !selectedPortfolioId) {
        setSelectedPortfolioId(portfoliosArray[0].id);
      }
    } catch (error: any) {
      console.error('Error loading portfolios:', error);
      setPortfolios([]);
      // Don't show error toast - just handle gracefully
    } finally {
      setLoadingPortfolios(false);
    }
  };

  const handleExport = async () => {
    if (!selectedPortfolioId) {
      toast({
        title: "Error",
        description: "Please select a portfolio",
        variant: "destructive",
      });
      return;
    }

    try {
      setExporting(true);
      const result = await exportApi.exportHTML(selectedPortfolioId);

      // If result has job_id, set the job and check status
      if (result.job_id) {
        const jobStatus = result.status || 'processing';
        setExportJob({ id: result.job_id, status: jobStatus, export_type: exportType });
        
        // Immediately check job status to get latest state (in case it failed immediately)
        if (jobStatus === 'processing' || !result.status) {
          // Start polling for status updates
          if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current);
          }
          // Initial check after 1 second
          setTimeout(() => {
            checkExportStatus(result.job_id, jobStatus);
          }, 1000);
          // Then poll every 2 seconds
          statusCheckIntervalRef.current = setInterval(() => {
            checkExportStatus(result.job_id);
          }, 2000);
        } else if (jobStatus === 'completed') {
          toast({
            title: "Export Complete",
            description: result.message || "Export completed successfully",
          });
        } else if (jobStatus === 'failed') {
          // Check job to get error message
          checkExportStatus(result.job_id, jobStatus);
        }
      } else {
        toast({
          title: "Export Started",
          description: result.message || "Export job created successfully",
        });
      }
    } catch (error: any) {
      // Safely extract error message - ensure it's always a string
      let errorMessage = "Failed to start export";
      if (error && typeof error === 'object') {
        if (typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (error.response?.data?.error && typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.detail && typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Extract error data from error object (direct properties or response.data)
      // The API client now attaches error data directly to the error object
      const errorData = error?.response?.data || {};
      const jobId = error?.job_id || errorData?.job_id;
      const errorStatus = error?.status || errorData?.status || 'failed';
      // Use errorMessage we extracted above, not errorData.error (which might be an object)
      const errorMsg = (errorData?.error && typeof errorData.error === 'string') 
        ? errorData.error 
        : errorMessage;
      
      // If error contains job_id (from backend error response), store job data
      if (jobId) {
        // Store error details from response if available
        const jobData: any = {
          id: jobId,
          status: errorStatus,
          export_type: exportType,
          error_message: errorMsg,
        };
        
        setExportJob(jobData);
        
        // Check job status to get error details
        setTimeout(() => {
          checkExportStatus(jobId, 'processing');
        }, 500);
      } else {
        // Show error message
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setExporting(false);
    }
  };

  const checkExportStatus = useCallback(async (jobId: number, currentStatus?: string) => {
    if (!jobId) return;

    try {
      setCheckingStatus(true);
      const job = await exportApi.getExportJob(jobId);
      
      // Get previous status from state
      setExportJob((prevJob: any) => {
        const oldStatus = currentStatus || prevJob?.status;
        
        if (job.status === "completed") {
          // Clear polling interval
          if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current);
            statusCheckIntervalRef.current = null;
          }
          // Only show toast if status just changed to completed
          if (oldStatus !== "completed") {
            toast({
              title: "Export Complete",
              description: "Your export is ready for download",
            });
          }
          setCheckingStatus(false);
        } else if (job.status === "failed") {
          // Clear polling interval
          if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current);
            statusCheckIntervalRef.current = null;
          }
          const errorMsg = job.error_message || "Export failed";
          // Only show toast if status just changed to failed
          if (oldStatus !== "failed") {
            toast({
              title: "Export Failed",
              description: errorMsg,
              variant: "destructive",
            });
          }
          setCheckingStatus(false);
        } else if (job.status === "processing") {
          // Continue polling if still processing
          setCheckingStatus(false);
        }
        
        return job;
      });
    } catch (error: any) {
      console.error("Failed to check export status:", error);
      setCheckingStatus(false);
      // Clear interval on error
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    }
  }, []);

  const handleDownload = async () => {
    if (!exportJob?.id) return;

    try {
      // File extension is always zip for HTML exports
      const fileExtension = 'zip';
      const portfolioTitle = portfolios.find(p => p.id === selectedPortfolioId)?.title || 'portfolio';
      const fileName = `${portfolioTitle.replace(/\s+/g, '_')}_portfolio.${fileExtension}`;
      
      // Use the API client for download
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/export/jobs/${exportJob.id}/download/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Download Started",
          description: "Your export file is downloading",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || "Failed to download export");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download export",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "processing":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden bg-professional-image-2">
      {/* Professional Background Overlay */}
      <div className="bg-overlay-dark"></div>
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 relative z-50">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-4xl relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Export Portfolio</h1>
          <p className="text-muted-foreground">
            Export your portfolio as HTML
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium">Select Portfolio</label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={loadPortfolios}
                  disabled={loadingPortfolios}
                  title="Refresh portfolios"
                >
                  <RefreshCw className={`h-3 w-3 ${loadingPortfolios ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {loadingPortfolios ? (
                <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading portfolios...</span>
                </div>
              ) : (
                <Select
                  value={selectedPortfolioId?.toString() || ""}
                  onValueChange={(value) => {
                    if (value !== "no-portfolios") {
                      setSelectedPortfolioId(parseInt(value));
                    }
                  }}
                  disabled={portfolios.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        portfolios.length === 0 
                          ? "No portfolios available" 
                          : "Choose a portfolio"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.length === 0 ? (
                      <SelectItem value="no-portfolios" disabled>
                        No portfolios available. Create one in the Dashboard.
                      </SelectItem>
                    ) : (
                      portfolios.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              {portfolios.length === 0 && !loadingPortfolios && (
                <p className="text-xs text-muted-foreground mt-2">
                  No portfolios found. <button 
                    onClick={() => navigate("/dashboard")}
                    className="text-primary hover:underline"
                  >
                    Create a portfolio
                  </button> to get started.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Export Format</label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-muted/50">
                <span className="text-sm">HTML/CSS/JS (ZIP)</span>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={exporting || !selectedPortfolioId || loadingPortfolios}
              className="w-full"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Start Export
                </>
              )}
            </Button>
          </div>
        </Card>

        {exportJob && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(exportJob.status)}
                  <div>
                    <p className="font-semibold">
                      {exportJob.status === "completed"
                        ? "Export Complete"
                        : exportJob.status === "processing"
                        ? "Processing..."
                        : exportJob.status === "failed"
                        ? "Export Failed"
                        : "Pending"}
                    </p>
                    {exportJob.status === "processing" && (
                      <p className="text-sm text-muted-foreground">
                        This may take a few moments...
                      </p>
                    )}
                  </div>
                </div>
                {exportJob.status === "processing" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => checkExportStatus(exportJob.id, exportJob.status)}
                    disabled={checkingStatus}
                  >
                    {checkingStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Check Status"
                    )}
                  </Button>
                )}
              </div>

              {exportJob.status === "completed" && (
                <Button onClick={handleDownload} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Export
                </Button>
              )}

              {exportJob.error_message && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-red-500 mb-1">Error Details</p>
                    <p className="text-sm text-red-400">
                      {typeof exportJob.error_message === 'string' 
                        ? exportJob.error_message 
                        : 'An error occurred during export'}
                    </p>
                  </div>
                  {exportJob.error_type && typeof exportJob.error_type === 'string' && (
                    <div>
                      <p className="text-xs font-semibold text-red-500/80 mb-1">Error Type: {exportJob.error_type}</p>
                    </div>
                  )}
                  {exportJob.instructions && 
                   typeof exportJob.instructions === 'object' && 
                   !Array.isArray(exportJob.instructions) && (
                    <div className="mt-3 pt-3 border-t border-red-500/20">
                      <p className="text-xs font-semibold text-red-500/80 mb-2">
                        {exportJob.instructions.title && typeof exportJob.instructions.title === 'string'
                          ? exportJob.instructions.title 
                          : "Installation Instructions"}
                      </p>
                      {exportJob.instructions.instructions && 
                       Array.isArray(exportJob.instructions.instructions) && 
                       exportJob.instructions.instructions.length > 0 && (
                        <ul className="text-xs text-red-400/80 space-y-1 list-disc list-inside">
                          {exportJob.instructions.instructions
                            .filter((instruction: any) => typeof instruction === 'string')
                            .map((instruction: string, index: number) => (
                              <li key={index}>{instruction}</li>
                            ))}
                        </ul>
                      )}
                      {exportJob.instructions.docs_url && 
                       typeof exportJob.instructions.docs_url === 'string' && (
                        <p className="text-xs text-red-400/80 mt-2">
                          <a
                            href={exportJob.instructions.docs_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-red-300"
                          >
                            View Documentation →
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        <Card className="p-6 mt-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Export Formats</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>HTML/CSS/JS:</strong> Complete static website bundle with all assets
              included. Perfect for hosting on any static hosting service.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Export;

