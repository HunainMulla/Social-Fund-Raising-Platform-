import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CreatePost from "../components/CreatePost";
import Posts from "../components/Posts";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, Filter, TrendingUp, Users, Calendar, Plus } from "lucide-react";
import { API_BASE_URL } from "../lib/api";

const PostsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [stats, setStats] = useState({
    activePosts: 0,
    activeUsers: 0,
    postsThisMonth: 0,
    isLoading: true
  });

  const categories = [
    "All",
    "General",
    "Campaign Update",
    "Community",
    "Education", 
    "Healthcare",
    "Environment",
    "Animal Welfare",
    "Arts & Culture",
    "Technology",
    "Sports"
  ];

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          activePosts: data.activePosts || 0,
          activeUsers: data.activeUsers || 0,
          postsThisMonth: data.postsThisMonth || 0,
          isLoading: false
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Posts</h1>
                <p className="text-gray-600">Stay connected with the latest updates from your community</p>
              </div>
              <Button 
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="comments">Most Comments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Posts Feed */}
            <div className="lg:col-span-2">
              {/* Create Post Section */}
              {showCreatePost && (
                <div className="mb-6">
                  <CreatePost 
                    onPostCreated={() => {
                      setRefreshTrigger(prev => prev + 1);
                      setShowCreatePost(false);
                    }} 
                  />
                </div>
              )}

              {/* Posts List */}
              <Posts 
                refreshTrigger={refreshTrigger}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                sortBy={sortBy}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Stats Card */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Community Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-600">Active Posts</span>
                      </div>
                      <span className="font-semibold">
                        {stats.isLoading ? "Loading..." : stats.activePosts}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm text-gray-600">Active Users</span>
                      </div>
                      <span className="font-semibold">
                        {stats.isLoading ? "Loading..." : stats.activeUsers}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="text-sm text-gray-600">This Month</span>
                      </div>
                      <span className="font-semibold">
                        {stats.isLoading ? "Loading..." : stats.postsThisMonth}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Popular Categories */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
                  <div className="space-y-3">
                    {categories.slice(1, 6).map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowCreatePost(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/create-campaign'}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Start Campaign
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        setRefreshTrigger(prev => prev + 1);
                        fetchStats();
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Refresh Feed
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PostsPage; 