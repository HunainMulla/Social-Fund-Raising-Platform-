import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CampaignCard from "../components/CampaignCard";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { 
  Edit, 
  Settings, 
  Heart, 
  Users, 
  DollarSign, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  Camera,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { API_BASE_URL } from "../lib/api";

interface UserCampaign {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  daysLeft: number;
  location: string;
  category: string;
  backers: number;
  status: "active" | "completed" | "draft";
  createdAt: string;
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [user, setUser] = useState({
    name: "Loading...",
    email: "Loading...",
    phone: "Loading...",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80",
    location: "Loading...",
    bio: "Loading...",
    joinedDate: "Loading...",
    totalCampaigns: 0,
    totalRaised: 0,
    totalBackers: 0
  });

  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: ""
  });

  // Password verification modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [userCampaigns, setUserCampaigns] = useState<UserCampaign[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/protected/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Profile data:", data);
        
        if (data.user) {
          // Update user state with actual data from backend
          const userData = {
            name: data.user.name || "No name provided",
            email: data.user.email || "No email provided",
            phone: data.user.mobile || "No phone provided",
            avatar: data.user.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80",
            location: data.user.location || "No location provided",
            bio: data.user.bio || "No bio provided",
            joinedDate: data.user.createdAt ? new Date(data.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Unknown",
            totalCampaigns: data.user.campaigns ? data.user.campaigns.length : 0,
            totalRaised: data.user.campaigns ? data.user.campaigns.reduce((sum, campaign) => sum + (campaign.currentAmount || 0), 0) : 0,
            totalBackers: data.user.campaigns ? data.user.campaigns.reduce((sum, campaign) => sum + (campaign.backers ? campaign.backers.length : 0), 0) : 0
          };
          
          setUser(userData);
          
          // Initialize form data
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.mobile || "",
            location: data.user.location || "",
            bio: data.user.bio || ""
          });

          // Update campaigns if they exist - use actual _id from backend
          if (data.user.campaigns && data.user.campaigns.length > 0) {
            const campaigns = data.user.campaigns.map((campaign: any) => {
              // Calculate days left
              const endDate = campaign.endDate ? new Date(campaign.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              const currentDate = new Date();
              const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
              
              return {
                id: campaign._id, // Use actual MongoDB _id
                title: campaign.name || "Untitled Campaign",
                description: campaign.description || "No description provided",
                image: campaign.image || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80",
                raised: campaign.currentAmount || 0,
                goal: campaign.amount || 0,
                daysLeft: daysLeft,
                location: campaign.location || "Location not specified",
                category: campaign.category || "General",
                backers: campaign.backers ? campaign.backers.length : 0, // Count actual backers
                status: campaign.currentAmount >= campaign.amount ? "completed" : "active",
                createdAt: campaign.startDate ? new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              };
            });
            setUserCampaigns(campaigns);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUser();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = () => {
    setShowPasswordModal(true);
    setPassword("");
    setPasswordError("");
  };

  const handlePasswordVerification = async () => {
    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    setIsVerifying(true);
    setPasswordError("");

    try {
      const token = localStorage.getItem("token");
      
      // First verify the password
      const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setPasswordError(verifyData.message || "Password verification failed");
        return;
      }

      // If password is correct, update the profile
      setIsUpdating(true);
      const updateResponse = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const updateData = await updateResponse.json();

      if (updateResponse.ok) {
        // Update local state with new data
        setUser(prev => ({
          ...prev,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio
        }));

        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...currentUser,
          name: formData.name,
          email: formData.email
        }));

        setShowPasswordModal(false);
        alert("Profile updated successfully!");
      } else {
        setPasswordError(updateData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setPasswordError("Network error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original user data
    setFormData({
      name: user.name === "No name provided" ? "" : user.name,
      email: user.email === "No email provided" ? "" : user.email,
      phone: user.phone === "No phone provided" ? "" : user.phone,
      location: user.location === "No location provided" ? "" : user.location,
      bio: user.bio === "No bio provided" ? "" : user.bio
    });
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(campaignId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/auth/delete-campaign/${campaignId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Remove campaign from UI
        setUserCampaigns(prevCampaigns => 
          prevCampaigns.filter(campaign => campaign.id !== campaignId)
        );
        
        // Update user stats
        setUser(prev => ({
          ...prev,
          totalCampaigns: prev.totalCampaigns - 1,
          totalRaised: prev.totalRaised - (userCampaigns.find(c => c.id === campaignId)?.raised || 0)
        }));

        alert("Campaign deleted successfully!");
      } else {
        alert(data.message || "Failed to delete campaign");
      }
    } catch (error) {
      console.error("Delete campaign error:", error);
      alert("Network error occurred. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return null;
    }
  };

  const handleCampaignClick = (campaign: UserCampaign) => {
    // Handle campaign click - could open modal or navigate to campaign detail
    console.log("Campaign clicked:", campaign.title);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar Section */}
                <div className="relative">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80";
                    }}
                  />
                  <Button 
                    size="sm" 
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    {/* <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button> */}
                  </div>
                  
                  <p className="text-gray-600 mb-4 max-w-2xl">{user.bio}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 sm:flex sm:flex-wrap sm:space-x-6">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{user.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{user.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>Joined {user.joinedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="w-full mt-4 md:mt-0 md:w-auto grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 text-center">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg md:text-xl font-bold text-blue-600">{user.totalCampaigns}</div>
                    <div className="text-xs md:text-sm text-gray-500">Campaigns</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg md:text-xl font-bold text-green-600">${user.totalRaised.toLocaleString()}</div>
                    <div className="text-xs md:text-sm text-gray-500">Total Raised</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg md:text-xl font-bold text-purple-600">{user.totalBackers}</div>
                    <div className="text-xs md:text-sm text-gray-500">Total Backers</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
            <Button
              variant={activeTab === "campaigns" ? "default" : "ghost"}
              onClick={() => setActiveTab("campaigns")}
              className="flex-1"
            >
              My Campaigns
            </Button>
            <Button
              variant={activeTab === "backed" ? "default" : "ghost"}
              onClick={() => setActiveTab("backed")}
              className="flex-1"
            >
              Backed Campaigns
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              onClick={() => setActiveTab("settings")}
              className="flex-1"
            >
              Settings
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === "campaigns" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Campaigns</h2>
                <Link to="/create-campaign">
                  <Button className="bg-yellow-500 hover:bg-yellow-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Campaign
                  </Button>
                </Link>
              </div>

              {userCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven't created any campaigns yet.</p>
                  <Link to="/create-campaign">
                    <Button className="bg-yellow-500 hover:bg-yellow-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Campaign
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userCampaigns.map((campaign) => (
                    <div key={campaign.id} className="relative">
                      <CampaignCard 
                        {...campaign} 
                        onClick={() => handleCampaignClick(campaign)}
                      />
                      <div className="absolute top-3 right-3 flex space-x-2">
                        {getStatusBadge(campaign.status)}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCampaign(campaign.id);
                          }}
                          disabled={isDeleting === campaign.id}
                        >
                          {isDeleting === campaign.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "backed" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Campaigns I've Backed</h2>
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">You haven't backed any campaigns yet.</p>
                <Link to="/">
                  <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600">
                    Explore Campaigns
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input 
                            type="text" 
                            value={formData.location}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Bio</h3>
                      <textarea 
                        value={formData.bio}
                        rows={4}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                      <Button className="bg-yellow-500 hover:bg-yellow-600" onClick={handleSaveChanges}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Password Verification Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verify Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  className="pr-10"
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordVerification()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {passwordError && (
              <p className="text-red-600 text-sm mt-2">{passwordError}</p>
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordModal(false)}
              disabled={isVerifying || isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordVerification}
              disabled={isVerifying || isUpdating || !password.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isVerifying ? (
                <>
                  <Lock className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : isUpdating ? (
                <>
                  <Lock className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Verify & Update
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage; 