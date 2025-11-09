import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportApi, portfolioApi } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

const Export = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [exportType, setExportType] = useState<"html" | "pdf">("html");
  const [exporting, setExporting] = useState(false);
  const [exportJob, setExportJob] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (exportJob) {
      checkExportStatus();
    }
  }, [exportJob]);

  const loadPortfolios = async () => {
    try {
      const data = await portfolioApi.getPortfolios();
      setPortfolios(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setSelectedPortfolioId(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load portfolios",
        variant: "destructive",
      });
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
      let result;
      if (exportType === "html") {
        result = await exportApi.exportHTML(selectedPortfolioId);
      } else {
        result = await exportApi.exportPDF(selectedPortfolioId);
      }

      setExportJob({ id: result.job_id, status: result.status });
      toast({
        title: "Export Started",
        description: result.message || "Export job created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start export",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const checkExportStatus = async () => {
    if (!exportJob?.id) return;

    try {
      setCheckingStatus(true);
      const job = await exportApi.getExportJob(exportJob.id);
      setExportJob(job);

      if (job.status === "completed") {
        toast({
          title: "Export Complete",
          description: "Your export is ready for download",
        });
      } else if (job.status === "failed") {
        toast({
          title: "Export Failed",
          description: job.error_message || "Export failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to check export status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleDownload = async () => {
    if (!exportJob?.id) return;

    try {
      // In a real implementation, this would trigger a file download
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
        a.download = `portfolio_export_${exportJob.id}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Download Started",
          description: "Your export file is downloading",
        });
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
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Export Portfolio</h1>
          <p className="text-muted-foreground">
            Export your portfolio as HTML or PDF
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Portfolio</label>
              <Select
                value={selectedPortfolioId?.toString() || ""}
                onValueChange={(value) => setSelectedPortfolioId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a portfolio" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Export Format</label>
              <Select value={exportType} onValueChange={(value: "html" | "pdf") => setExportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML/CSS/JS (ZIP)</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExport}
              disabled={exporting || !selectedPortfolioId}
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
                    onClick={checkExportStatus}
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
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-500">{exportJob.error_message}</p>
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
            <p>
              <strong>PDF:</strong> Printable document format. Great for sharing or printing
              your portfolio.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Export;

