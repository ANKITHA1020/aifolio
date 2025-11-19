import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UploadResume from "./pages/UploadResume";
import GenerateContent from "./pages/GenerateContent";
import ChooseTemplate from "./pages/ChooseTemplate";
import PortfolioBuilder from "./pages/PortfolioBuilder";
import PortfolioPreview from "./pages/PortfolioPreview";
import PublicPortfolio from "./pages/PublicPortfolio";
import Projects from "./pages/Projects";
import BlogPosts from "./pages/BlogPosts";
import SEOAnalysis from "./pages/SEOAnalysis";
import Analytics from "./pages/Analytics";
import Export from "./pages/Export";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* site-wide animated background wrapper */}
        <div className="bg-site-animated min-h-screen">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upload-resume" element={<UploadResume />} />
              <Route path="/generate-content" element={<GenerateContent />} />
              <Route path="/choose-template" element={<ChooseTemplate />} />
              <Route path="/portfolio-builder" element={<PortfolioBuilder />} />
              <Route path="/portfolio-preview/:id" element={<PortfolioPreview />} />
              <Route path="/portfolio/:slug" element={<PublicPortfolio />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/blog-posts" element={<BlogPosts />} />
              <Route path="/seo-analysis" element={<SEOAnalysis />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/export" element={<Export />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
