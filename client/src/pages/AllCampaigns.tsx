import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CampaignCard from "../components/CampaignCard";
import CampaignDetailModal from "../components/CampaignDetailModal";
import CategoryFilter from "../components/CategoryFilter";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, Grid, List, Plus } from "lucide-react";
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
}

const AllCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get search query from URL params
  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearchQuery(query);
  }, [searchParams]);

  // Fetch campaigns from backend
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/auth/all-campaigns`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched campaigns:", data);
        
        if (data.campaigns) {
          setCampaigns(data.campaigns);
          setFilteredCampaigns(data.campaigns);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setError("Failed to load campaigns. Please try again later.");
        setCampaigns([]);
        setFilteredCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Filter and search campaigns
  useEffect(() => {
    let filtered = [...campaigns];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(campaign => 
        campaign.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        break;
      case "funded":
        filtered.sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
        break;
      case "ending":
        filtered.sort((a, b) => a.daysLeft - b.daysLeft);
        break;
      case "goal":
        filtered.sort((a, b) => b.goal - a.goal);
        break;
      default:
        break;
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchQuery, selectedCategory, sortBy]);

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Update URL params
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const handleCreateCampaign = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/create-campaign");
  };

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "health", name: "Health & Medical" },
    { id: "education", name: "Education" },
    { id: "environment", name: "Environment" },
    { id: "community", name: "Community" },
    { id: "sports", name: "Sports & Recreation" },
    { id: "arts", name: "Arts & Culture" },
    { id: "technology", name: "Technology" },
    { id: "animal", name: "Animal Welfare" },
    { id: "emergency", name: "Emergency Relief" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <section className="bg-white border-b py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All Campaigns
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover and support campaigns that matter to your community
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search campaigns by title, description, category, or location..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
              />
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <span>{campaigns.length} total campaigns</span>
              <span>{filteredCampaigns.length} matching your search</span>
              <span>{campaigns.reduce((sum, c) => sum + c.backers, 0)} total backers</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline" 
              className="w-full flex items-center justify-center mb-4"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Create Campaign CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-2">Start Your Own Campaign</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Have a cause you're passionate about? Start fundraising today.
                </p>
                <Button 
                  onClick={handleCreateCampaign}
                  className="w-full  bg-yellow-500 hover:bg-yellow-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {searchQuery ? `Search results for "${searchQuery}"` : 'All Campaigns'}
                </h2>
                <span className="text-sm text-gray-500">
                  ({filteredCampaigns.length} campaigns)
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="funded">Most Funded</option>
                  <option value="ending">Ending Soon</option>
                  <option value="goal">Highest Goal</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading campaigns...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredCampaigns.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No campaigns found' : 'No campaigns yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters'
                    : 'Be the first to create a campaign in your community!'
                  }
                </p>
                {searchQuery && (
                  <Button 
                    onClick={() => handleSearchChange("")}
                    variant="outline" 
                    className="mr-4"
                  >
                    Clear Search
                  </Button>
                )}
                <Button onClick={handleCreateCampaign}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            )}

            {/* Campaigns Grid/List */}
            {!isLoading && !error && filteredCampaigns.length > 0 && (
              <>
                <div className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                  {filteredCampaigns.map((campaign) => (
                    <CampaignCard 
                      key={campaign.id} 
                      {...campaign} 
                      creator={campaign.creator}
                      onClick={() => handleCampaignClick(campaign)}
                    />
                  ))}
                </div>
                
                {/* Load More Button (Future Enhancement) */}
                <div className="text-center mt-8">
                  <Button variant="outline" size="lg">
                    Load More Campaigns
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Campaign Detail Modal */}
      <CampaignDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        campaign={selectedCampaign}
      />
    </div>
  );
};

export default AllCampaigns; 