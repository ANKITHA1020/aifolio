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
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyticsApi, portfolioApi } from "@/lib/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [views, setViews] = useState<any[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    loadPortfolios();
  }, []);

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

  const loadAnalytics = async () => {
    if (!selectedPortfolioId) return;

    try {
      setLoading(true);
      const [statsData, viewsData, clicksData] = await Promise.all([
        analyticsApi.getPortfolioStats(selectedPortfolioId),
        analyticsApi.getPortfolioViews(selectedPortfolioId, dateRange.start, dateRange.end),
        analyticsApi.getPortfolioClicks(selectedPortfolioId),
      ]);

      setStats(statsData);
      setViews(Array.isArray(viewsData) ? viewsData : []);
      setClicks(Array.isArray(clicksData) ? clicksData : []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Date range filters
  const handleDateRangeChange = (range: 'today' | 'week' | 'month' | 'year' | 'all') => {
    const now = new Date();
    let start: string | undefined;
    
    switch (range) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0)).toISOString().split('T')[0];
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        break;
      case 'month':
        start = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
        break;
      case 'year':
        start = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
        break;
      default:
        start = undefined;
    }
    
    setDateRange({ start, end: undefined });
  };

  // Auto-refresh analytics and handle date range changes
  useEffect(() => {
    if (selectedPortfolioId) {
      loadAnalytics();
      
      const interval = setInterval(() => {
        loadAnalytics();
      }, 30000); // 30 seconds
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPortfolioId, dateRange]);

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

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track your portfolio performance</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => handleDateRangeChange('today')}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDateRangeChange('week')}>
                  Week
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDateRangeChange('month')}>
                  Month
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDateRangeChange('year')}>
                  Year
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDateRangeChange('all')}>
                  All
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{stats.total_views || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Visitors</p>
                    <p className="text-2xl font-bold">{stats.unique_visitors || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MousePointerClick className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                    <p className="text-2xl font-bold">{stats.total_clicks || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Duration</p>
                    <p className="text-2xl font-bold">
                      {Math.round(stats.avg_session_duration || 0)}s
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Views Over Time */}
            {views.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Views Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={views}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#8884d8" name="Views" />
                    <Line
                      type="monotone"
                      dataKey="unique_visitors"
                      stroke="#82ca9d"
                      name="Unique Visitors"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Click Events */}
            {clicks.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Click Events by Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={clicks}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, count }) => `${name}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {clicks.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Top Clicked Elements */}
            {clicks.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Top Clicked Elements</h2>
                <div className="space-y-2">
                  {clicks.slice(0, 10).map((click, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded">
                      <div>
                        <p className="font-medium">{click.element_id}</p>
                        <p className="text-sm text-muted-foreground">{click.element_type}</p>
                      </div>
                      <p className="font-bold">{click.count} clicks</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Select a portfolio to view analytics</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;

