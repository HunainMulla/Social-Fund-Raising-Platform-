import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import FeaturedCampaign from "../components/FeaturedCampaign";
import CampaignCard from "../components/CampaignCard";
import CampaignDetailModal from "../components/CampaignDetailModal";
import CategoryFilter from "../components/CategoryFilter";
import Stats from "../components/Stats";
import Footer from "../components/Footer";
import Posts from "../components/Posts";
import CreatePost from "../components/CreatePost";
import { Button } from "../components/ui/button";
import { ArrowRight, MapPin, MessageCircle, Plus, Filter } from "lucide-react";
import { API_BASE_URL } from "../lib/api";
import { useToast } from "../hooks/use-toast";

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

const Index = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshPosts, setRefreshPosts] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Show notification about potential delay on initial load
  useEffect(() => {
    toast({
      title: "⚠️ Important Notice",
      description: "Users, it may take around 20-30 seconds to fetch data from backend as due to inactivity the backend server sleeps temporarily.",
      duration: 15000, // Show for 15 seconds
      className: "bg-yellow-50 border-yellow-200 text-yellow-800",
    });
  }, [toast]);

  // Wake up server on initial load
  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/all-campaigns`, { method: 'GET' })
      .then(() => console.log('Server wake-up ping sent'))
      .catch(() => {});
  }, []);

  // Fetch campaigns from backend on component mount
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
          // Debug: Check if mobile numbers are being returned
          data.campaigns.forEach((campaign, index) => {
            console.log(`Campaign ${index + 1} creator:`, campaign.creator);
          });
          setCampaigns(data.campaigns);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setError("Failed to load campaigns. Please try again later.");
        
        // Fallback to sample data in case of error
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleCreateCampaign = () => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      // Redirect to login if not authenticated
      navigate("/login");
      return;
    }
    // Navigate to campaign creation page
    navigate("/create-campaign");
  };

  const filteredCampaigns = selectedCategory === "All"
    ? campaigns
    : campaigns.filter(c => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-yellow-500 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            Fund What Matters <br />
            <span className="text-yellow-100">In Your Community</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto text-yellow-100 px-4">
            Discover and support local causes that make a real difference in your neighborhood
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link to="/campaigns">
              <Button size="lg" className="bg-white text-yellow-600 hover:bg-yellow-50 text-base md:text-lg px-6 md:px-8 w-full sm:w-auto">
                Explore Campaigns
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-yellow-600 hover:bg-yellow-600 text-base md:text-lg px-6 md:px-8 w-full sm:w-auto"
              onClick={handleCreateCampaign}
            >
              <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Start Your Campaign
            </Button>
          </div>
        </div>
      </section>

      {/* Location Banner */}
      <section className="bg-white border-b py-3 md:py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left text-gray-600 text-sm md:text-base">
            <div className="flex items-center mb-2 sm:mb-0">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Showing campaigns from community members</span>
            </div>
            {/* <Button variant="link" className="text-blue-600 text-sm md:text-base p-0 sm:ml-2">
              Filter by Location
            </Button> */}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Featured Campaign */}
        <section className="mb-8 md:mb-12">
          <FeaturedCampaign />
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Mobile Category Filter Button */}
          <div className="lg:hidden mb-4">
            <Button 
              onClick={() => setShowSidebar(!showSidebar)}
              variant="outline" 
              className="w-full flex items-center justify-center"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showSidebar ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Sidebar - Hidden on mobile unless toggled */}
          <div className={`lg:col-span-1 ${showSidebar ? 'block' : 'hidden lg:block'} ${showSidebar ? 'mb-6' : ''}`}>
            <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
          </div>

          {/* Campaigns Grid */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-3">
              <h2 className="text-xl md:text-2xl font-bold">Community Campaigns</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <select className="px-3 md:px-4 py-2 border rounded-lg bg-white text-sm md:text-base">
                  <option>Sort by: Most Recent</option>
                  <option>Sort by: Most Funded</option>
                  <option>Sort by: Ending Soon</option>
                  <option>Sort by: Goal Amount</option>
                </select>
                <Button 
                  onClick={handleCreateCampaign}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm md:text-base px-4 md:px-6"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Create Campaign</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </div>
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8 md:py-12">
                <div className="animate-spin h-6 w-6 md:h-8 md:w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm md:text-base">Loading campaigns...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8 md:py-12">
                <p className="text-red-600 mb-4 text-sm md:text-base px-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && campaigns.length === 0 && (
              <div className="text-center py-8 md:py-12 px-4">
                <div className="text-gray-400 mb-4">
                  <svg className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v8m0 0V9.5a2 2 0 012-2h2M7 13l3 3 7-7" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base">Be the first to create a campaign in your community!</p>
                <Button 
                  onClick={handleCreateCampaign}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Campaign
                </Button>
              </div>
            )}

            {/* Campaigns Grid */}
            {!isLoading && !error && campaigns.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {filteredCampaigns.map((campaign) => (
                    <CampaignCard 
                      key={campaign.id} 
                      {...campaign} 
                      creator={campaign.creator}
                      onClick={() => handleCampaignClick(campaign)}
                    />
                  ))}
                </div>
                
                <div className="text-center mt-6 md:mt-8">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Load More Campaigns
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Posts Feed - Hidden on mobile by default */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-bold">Campaign Updates</h3>
                <Link to="/posts">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </Link>
              </div>
              <CreatePost onPostCreated={() => setRefreshPosts(prev => prev + 1)} />
              <Posts refreshTrigger={refreshPosts} />
            </div>
          </div>
        </div>

        {/* Mobile Posts Section */}
        <section className="lg:hidden mt-8 md:mt-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold">Campaign Updates</h3>
            <Link to="/posts">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                <MessageCircle className="h-4 w-4 mr-1" />
                View All
              </Button>
            </Link>
          </div>
          <CreatePost onPostCreated={() => setRefreshPosts(prev => prev + 1)} />
          <Posts refreshTrigger={refreshPosts} />
        </section>
      </div>

      {/* Stats Section */}
      <Stats />

      {/* CTA Section */}
      <section className="bg-yellow-500 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Whether you're looking to support a cause or start your own campaign, 
            every contribution helps build stronger communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
              onClick={handleCreateCampaign}
            >
              <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Start a Campaign
            </Button>
            <Link to="/campaigns">
              <Button size="lg" variant="outline" className="border-white text-blue-600 hover:bg-white hover:text-blue-600 w-full sm:w-auto">
                Browse All Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </section>

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

export default Index;
