import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  Calendar, 
  ChartBar,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye
} from "lucide-react";
import Header from "../components/Header";
import { API_BASE_URL } from "../lib/api";

interface CampaignCreator {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinedDate: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  additionalImages: string[];
  raised: number;
  goal: number;
  daysLeft: number;
  location: string;
  category: string;
  backers: number;
  creator: CampaignCreator;
  startDate: string;
  endDate: string;
  status?: 'active' | 'funded' | 'expired';
}

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
  totalBackers: number;
  successRate: number;
  monthlyGrowth: number;
}

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Check authentication and fetch user data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  // Fetch user's campaigns and stats
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch user's campaigns
        const campaignsResponse = await fetch(`${API_BASE_URL}/auth/user-campaigns`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!campaignsResponse.ok) {
          if (campaignsResponse.status === 401) {
            localStorage.clear();
            navigate("/login");
            return;
          }
          throw new Error(`HTTP error! status: ${campaignsResponse.status}`);
        }

        const campaignsData = await campaignsResponse.json();
        console.log("User campaigns:", campaignsData);

        if (campaignsData.campaigns) {
          const userCampaigns = campaignsData.campaigns.map((campaign: any) => ({
            ...campaign,
            status: campaign.daysLeft <= 0 ? 'expired' : 
                   (campaign.raised >= campaign.goal ? 'funded' : 'active')
          }));
          setCampaigns(userCampaigns);
          
          // Calculate stats from user's campaigns
          const totalRaised = userCampaigns.reduce((sum: number, c: Campaign) => sum + c.raised, 0);
          const totalBackers = userCampaigns.reduce((sum: number, c: Campaign) => sum + c.backers, 0);
          const activeCampaigns = userCampaigns.filter((c: Campaign) => c.status === 'active').length;
          const fundedCampaigns = userCampaigns.filter((c: Campaign) => c.status === 'funded').length;
          const successRate = userCampaigns.length > 0 ? (fundedCampaigns / userCampaigns.length) * 100 : 0;

          setStats({
            totalCampaigns: userCampaigns.length,
            activeCampaigns,
            totalRaised,
            totalBackers,
            successRate,
            monthlyGrowth: 12.5 // This would need to be calculated from historical data
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  // Generate chart data from user's campaigns
  const generateChartData = () => {
    if (!campaigns.length) return [];

    // Group campaigns by month for the chart
    const monthlyData = campaigns.reduce((acc: any, campaign) => {
      const date = new Date(campaign.startDate);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, amount: 0, campaigns: 0 };
      }
      
      acc[monthKey].amount += campaign.raised;
      acc[monthKey].campaigns += 1;
      
      return acc;
    }, {});

    return Object.values(monthlyData).slice(-6); // Last 6 months
  };

  // Generate category data from user's campaigns
  const generateCategoryData = () => {
    if (!campaigns.length) return [];

    const categoryCount = campaigns.reduce((acc: any, campaign) => {
      const category = campaign.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
    return Object.entries(categoryCount).map(([name, count], index) => ({
      name,
      value: Math.round((count as number / campaigns.length) * 100),
      color: colors[index % colors.length]
    }));
  };

  const monthlyData = generateChartData();
  const categoryData = generateCategoryData();

  const chartConfig = {
    amount: {
      label: "Amount ($)",
      color: "#3b82f6",
    },
    campaigns: {
      label: "Campaigns",
      color: "#22c55e",
    },
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'funded':
        return <Badge variant="default" className="bg-green-100 text-green-800">Funded</Badge>;
      case 'expired':
        return <Badge variant="default" className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'funded':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleCreateCampaign = () => {
    navigate("/create-campaign");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Dashboard</h1>
            <p className="text-gray-600 text-sm md:text-base">Track your campaign performance and funding progress</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant={selectedPeriod === "month" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("month")}
              size="sm"
            >
              This Month
            </Button>
            <Button 
              variant={selectedPeriod === "year" ? "default" : "outline"}
              onClick={() => setSelectedPeriod("year")}
              size="sm"
            >
              This Year
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 md:mb-8 bg-white p-1 rounded-lg shadow-sm">
          <Button
            variant={selectedTab === "overview" ? "default" : "ghost"}
            onClick={() => setSelectedTab("overview")}
            className="flex-1 text-sm md:text-base"
            size="sm"
          >
            Overview
          </Button>
          <Button
            variant={selectedTab === "campaigns" ? "default" : "ghost"}
            onClick={() => setSelectedTab("campaigns")}
            className="flex-1 text-sm md:text-base"
            size="sm"
          >
            My Campaigns
          </Button>
        </div>

        {selectedTab === "overview" && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600 mb-1">Total Raised</p>
                      <p className="text-lg md:text-2xl font-bold">${stats?.totalRaised.toLocaleString() || '0'}</p>
                      <p className="text-xs md:text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{stats?.monthlyGrowth || 0}% this month
                      </p>
                    </div>
                    <div className="bg-blue-100 p-2 md:p-3 rounded-full">
                      <DollarSign className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600 mb-1">Active Campaigns</p>
                      <p className="text-lg md:text-2xl font-bold">{stats?.activeCampaigns || 0}</p>
                      <p className="text-xs md:text-sm text-blue-600">
                        of {stats?.totalCampaigns || 0} total
                      </p>
                    </div>
                    <div className="bg-green-100 p-2 md:p-3 rounded-full">
                      <Target className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600 mb-1">Total Backers</p>
                      <p className="text-lg md:text-2xl font-bold">{stats?.totalBackers.toLocaleString() || '0'}</p>
                      <p className="text-xs md:text-sm text-purple-600">
                        {campaigns.length > 0 ? Math.round(stats?.totalBackers / campaigns.length) : 0} avg per campaign
                      </p>
                    </div>
                    <div className="bg-purple-100 p-2 md:p-3 rounded-full">
                      <Users className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600 mb-1">Success Rate</p>
                      <p className="text-lg md:text-2xl font-bold">{stats?.successRate.toFixed(1) || '0'}%</p>
                      <p className="text-xs md:text-sm text-green-600">
                        {campaigns.filter(c => c.status === 'funded').length} funded campaigns
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-2 md:p-3 rounded-full">
                      <ChartBar className="h-4 w-4 md:h-6 md:w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            {campaigns.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Monthly Funding Chart */}
              <Card>
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="flex items-center text-base md:text-lg">
                      <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Campaign Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Campaign Categories */}
              <Card>
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-base md:text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                            outerRadius={60}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            ) : (
              <Card className="mb-6 md:mb-8">
                <CardContent className="p-6 md:p-8 text-center">
                  <Target className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-gray-600 mb-6 text-sm md:text-base">
                    Start your first campaign to see analytics and track your progress
                  </p>
                  <Button onClick={handleCreateCampaign} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {selectedTab === "campaigns" && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold">Your Campaigns</h2>
              <Button onClick={handleCreateCampaign} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>

            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="p-6 md:p-8 text-center">
                  <Heart className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No campaigns created</h3>
                  <p className="text-gray-600 mb-6 text-sm md:text-base">
                    Create your first campaign to start raising funds for your cause
                  </p>
                  <Button onClick={handleCreateCampaign} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {campaigns.map((campaign) => {
                const progressPercentage = (campaign.raised / campaign.goal) * 100;
                const isFunded = campaign.status === 'funded';
                const isNearGoal = progressPercentage >= 90 && campaign.status === 'active';

                return (
                  <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                          className="w-full h-32 md:h-48 object-cover"
                      />
                        <div className="absolute top-2 md:top-3 left-2 md:left-3">
                          {getStatusBadge(campaign.status || 'active')}
                      </div>
                      {isNearGoal && (
                          <div className="absolute top-2 md:top-3 right-2 md:right-3">
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">
                            Almost Funded!
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                      <CardContent className="p-4 md:p-6">
                        <div className="space-y-3 md:space-y-4">
                        <div>
                            <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2">
                            {campaign.title}
                          </h3>
                            <p className="text-gray-600 text-xs md:text-sm line-clamp-2">
                            {campaign.description}
                          </p>
                        </div>

                          <div className="space-y-2 md:space-y-3">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs md:text-sm text-gray-600">Progress</span>
                                <span className="text-xs md:text-sm font-medium">
                                {progressPercentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isFunded 
                                    ? 'bg-green-500' 
                                    : isNearGoal 
                                    ? 'bg-yellow-500' 
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                }`}
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Funding Stats */}
                            <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                            <div>
                              <p className="text-gray-600">Raised</p>
                              <p className="font-semibold text-green-600">
                                ${campaign.raised.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Goal</p>
                              <p className="font-semibold">
                                ${campaign.goal.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Backers</p>
                              <p className="font-semibold">{campaign.backers}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Days Left</p>
                              <p className="font-semibold">{campaign.daysLeft}</p>
                            </div>
                          </div>

                          {/* Creator Info */}
                          <div className="flex items-center space-x-3 pt-2 border-t">
                            <img
                              src={campaign.creator.avatar}
                              alt={campaign.creator.name}
                              className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80";
                              }}
                            />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-medium truncate">{campaign.creator.name}</p>
                              <p className="text-xs text-gray-500">{campaign.category}</p>
                            </div>
                            <div className="ml-auto">
                                {getStatusIcon(campaign.status || 'active')}
                              </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2 pt-2">
                            <Button 
                              variant="outline" 
                                className="flex-1 text-xs md:text-sm"
                                size="sm"
                              disabled={campaign.status === 'expired'}
                            >
                                <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">View</span>
                            </Button>
                            <Button 
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs md:text-sm"
                                size="sm"
                              disabled={campaign.status === 'expired'}
                            >
                                <Heart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="hidden sm:inline">Edit</span>
                                <span className="sm:hidden">Edit</span>
                            </Button>
                            </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
