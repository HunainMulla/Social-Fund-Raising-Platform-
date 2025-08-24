import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/use-toast";
import { 
  Search, 
  Users, 
  Heart, 
  Trash2, 
  Eye, 
  Edit, 
  Filter,
  MoreHorizontal,
  Calendar,
  MapPin,
  DollarSign,
  AlertTriangle,
  Shield,
  FileText
} from "lucide-react";
import { API_BASE_URL } from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  joinedDate: string;
  campaignsCount: number;
  totalRaised: number;
  isAdmin: boolean;
  status: "active" | "suspended" | "pending";
}

interface Campaign {
  id: string;
  title: string;
  creator: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  category: string;
  raised: number;
  goal: number;
  daysLeft: number;
  backers: number;
  status: "active" | "completed" | "suspended" | "pending";
  createdAt: string;
  location: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  timeAgo: string;
  status: string;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is admin on component mount
  useEffect(() => {
    checkAdminAccess();
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "campaigns") {
      fetchCampaigns();
    } else if (activeTab === "posts") {
      fetchPosts();
    }
  }, [activeTab]);

  const checkAdminAccess = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!token || !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/admin/users?page=${page}&limit=10`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalUsers
        });
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/admin/campaigns?page=${page}&limit=10`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalCampaigns
        });
      } else {
        throw new Error('Failed to fetch campaigns');
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/posts/admin/all?page=${page}&limit=10`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalPosts
        });
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (!window.confirm(`Are you sure you want to delete the campaign "${campaign.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/campaigns/${campaign.creator.id}/${campaign.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully!",
        });
        fetchCampaigns(); // Refresh the list
      } else {
        throw new Error('Failed to delete campaign');
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (post: Post) => {
    if (!window.confirm(`Are you sure you want to delete the post "${post.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts/admin/${post.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Post deleted successfully!",
        });
        fetchPosts(); // Refresh the list
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSuspendUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to suspend user "${user.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'suspend' })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User suspended successfully!",
        });
        fetchUsers(); // Refresh the list
      } else {
        throw new Error('Failed to suspend user');
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      toast({
        title: "Error",
        description: "Failed to suspend user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully!",
        });
        fetchUsers(); // Refresh the list
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return null;
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.creator.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage users, campaigns, and posts on the platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{campaigns.filter(c => c.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto whitespace-nowrap">
            {["campaigns", "users", "posts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "campaigns" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Management</h3>
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
                      <img 
                        src={campaign.creator.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80"} 
                        alt={campaign.creator.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">{campaign.title}</h4>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Creator:</strong> {campaign.creator.name} ({campaign.creator.email})</p>
                          <p><strong>Category:</strong> {campaign.category}</p>
                          <p><strong>Location:</strong> {campaign.location}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {campaign.backers} backers
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {campaign.daysLeft} days left
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCampaign(campaign)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h4>
                          {user.isAdmin && <Badge className="bg-purple-100 text-purple-800">Admin</Badge>}
                          {getStatusBadge(user.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Email:</strong> {user.email}</p>
                          <p><strong>Location:</strong> {user.location}</p>
                          <p><strong>Joined:</strong> {user.joinedDate}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {user.campaignsCount} campaigns
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${user.totalRaised.toLocaleString()} raised
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!user.isAdmin && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleSuspendUser(user)}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "posts" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Management</h3>
            {filteredPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
                      <img 
                        src={post.authorAvatar} 
                        alt={post.authorName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">{post.title}</h4>
                          {getStatusBadge(post.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Author:</strong> {post.authorName} ({post.authorEmail})</p>
                          <p><strong>Category:</strong> {post.category}</p>
                          <p className="text-gray-700">{post.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likes} likes
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {post.comments} comments
                          </span>
                          <span>{post.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeletePost(post)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalItems)} of {pagination.totalItems} results
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => {
                  if (activeTab === "users") fetchUsers(pagination.currentPage - 1);
                  else if (activeTab === "campaigns") fetchCampaigns(pagination.currentPage - 1);
                  else if (activeTab === "posts") fetchPosts(pagination.currentPage - 1);
                }}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => {
                  if (activeTab === "users") fetchUsers(pagination.currentPage + 1);
                  else if (activeTab === "campaigns") fetchCampaigns(pagination.currentPage + 1);
                  else if (activeTab === "posts") fetchPosts(pagination.currentPage + 1);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminPage; 