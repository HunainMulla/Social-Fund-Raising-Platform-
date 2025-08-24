import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Search, Bell, User, Heart, ChartBar, MessageCircle, LogOut, Menu, X, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("authHeader");
    
    // Reset component state
    setUser(null);
    setIsMobileMenuOpen(false);
    
    // Redirect to home page
    window.location.href = "/";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/campaigns?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCreateCampaign = () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    navigate("/create-campaign");
    setIsMobileMenuOpen(false);
  };

  // Check if user is admin
  const isAdmin = user?.isAdmin === true;
  
  // Debug logging
  console.log("Header - User data:", user);
  console.log("Header - isAdmin:", isAdmin);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3662/3662580.png" 
              alt="LocalFund Logo"
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-yellow-600">
              LocalFund
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/campaigns">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Browse Campaigns
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ChartBar className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}
            <Link to="/posts">
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Updates
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleCreateCampaign}>
              Start Campaign
            </Button>
            
            {user ? (
              <>
                {/* <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button> */}
                <div className="flex items-center space-x-2">
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="flex items-center">
                      {/* <img 
                        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80" 
                        alt={user.name}
                        className="w-6 h-6 rounded-full mr-2"
                      /> */}
                      <span>{user.name}</span>
                      {isAdmin && (
                        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          Admin
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 lg:hidden">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2 pt-4">
              <Link to="/campaigns" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Campaigns
                </Button>
              </Link>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <ChartBar className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Link to="/posts" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Updates
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleCreateCampaign}>
                Start Campaign
              </Button>
              
              {user ? (
                <>
                  {/* <Button variant="ghost" size="sm" className="w-full justify-start relative">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    <span className="absolute right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  </Button> */}
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      {/* <img 
                        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80" 
                        alt={user.name}
                        className="w-6 h-6 rounded-full mr-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80";
                        }}
                      /> */}
                      <span>{user.name} (Profile)</span>
                      {isAdmin && (
                        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          Admin
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="w-full justify-start text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
