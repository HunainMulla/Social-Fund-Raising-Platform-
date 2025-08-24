import { useState, useEffect } from "react";
import { Heart, MessageCircle, MoreHorizontal, Trash2, Send } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { API_BASE_URL } from "../lib/api";

interface Comment {
  id: string;
  content: string;
  userName: string;
  userAvatar: string;
  createdAt: string;
  timeAgo: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  timeAgo: string;
}

interface PostsProps {
  refreshTrigger?: number;
  searchQuery?: string;
  selectedCategory?: string;
  sortBy?: string;
}

const Posts = ({ refreshTrigger, searchQuery = "", selectedCategory = "All", sortBy = "recent" }: PostsProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [postComments, setPostComments] = useState<{ [key: string]: Comment[] }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  // Get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/posts/all?limit=10`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched posts:", data);
      
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  // Filter and sort posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes - a.likes;
      case "comments":
        return b.comments - a.comments;
      case "recent":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Handle like/unlike post
  const handleLike = async (postId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to like posts");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Update the post's like count
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, likes: data.likes }
              : post
          )
        );

        // Update liked posts set
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (data.isLiked) {
            newSet.add(postId);
          } else {
            newSet.delete(postId);
          }
          return newSet;
        });
      } else {
        alert(data.message || "Failed to like post");
      }
    } catch (error) {
      console.error("Like post error:", error);
      alert("Network error occurred");
    }
  };

  // Toggle comments visibility and fetch comments if needed
  const toggleComments = async (postId: string) => {
    const isExpanded = expandedComments.has(postId);
    
    if (isExpanded) {
      // Hide comments
      setExpandedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      // Show comments and fetch them if not already loaded
      setExpandedComments(prev => new Set(prev).add(postId));
      
      if (!postComments[postId]) {
        await fetchComments(postId);
      }
    }
  };

  // Fetch comments for a specific post
  const fetchComments = async (postId: string) => {
    setLoadingComments(prev => new Set(prev).add(postId));
    
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.comments) {
        setPostComments(prev => ({
          ...prev,
          [postId]: data.comments
        }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      alert("Failed to load comments");
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // Handle adding a comment
  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to comment");
      return;
    }

    setSubmittingComment(postId);

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add the new comment to the local state
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), {
            id: data.comment._id || Date.now().toString(),
            content: data.comment.content,
            userName: data.comment.userName,
            userAvatar: data.comment.userAvatar,
            createdAt: data.comment.createdAt,
            timeAgo: "just now"
          }]
        }));

        // Update post comment count
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, comments: data.totalComments }
              : post
          )
        );

        // Clear the input
        setCommentInputs(prev => ({
          ...prev,
          [postId]: ""
        }));
      } else {
        alert(data.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Add comment error:", error);
      alert("Network error occurred");
    } finally {
      setSubmittingComment(null);
    }
  };

  // Handle delete post (only for post author)
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to delete posts");
      return;
    }

    setDeletingPostId(postId);

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Remove post from UI
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        alert("Post deleted successfully");
      } else {
        alert(data.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Delete post error:", error);
      alert("Network error occurred");
    } finally {
      setDeletingPostId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPosts} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (filteredPosts.length === 0 && posts.length === 0) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 text-sm">Be the first to share an update!</p>
        </div>
      </div>
    );
  }

  if (filteredPosts.length === 0 && posts.length > 0) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts match your filters</h3>
          <p className="text-gray-600 text-sm">Try changing your search or category filter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {filteredPosts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          {/* Post Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                <img 
                  src={post.authorAvatar} 
                  alt={post.authorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-sm">{post.authorName}</p>
                <p className="text-xs text-gray-500">{post.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {/* Show delete button only for post author */}
              {currentUser && currentUser.name === post.authorName && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeletePost(post.id)}
                  disabled={deletingPostId === post.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {deletingPostId === post.id ? (
                    <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            </div>
          </div>

          {/* Post Image */}
          {post.image && (
          <div className="aspect-square">
            <img 
              src={post.image} 
              alt="Post content"
              className="w-full h-full object-cover"
            />
          </div>
          )}

          {/* Post Content */}
          <CardContent className="p-4">
            {/* Title */}
            <h3 className="font-semibold text-sm mb-2">{post.title}</h3>
            
            {/* Post Actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto"
                  onClick={() => handleLike(post.id)}
                >
                  <Heart 
                    className={`h-6 w-6 ${
                      likedPosts.has(post.id) ? 'fill-red-500 text-red-500' : ''
                    }`} 
                  />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Likes Count */}
            <p className="font-semibold text-sm mb-2">{post.likes} likes</p>

            {/* Content */}
            <div className="text-sm">
              {/* {post.content} */}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="text-blue-600 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Comments */}
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleComments(post.id)}
                className="text-gray-500 text-sm p-0 h-auto"
              >
                {post.comments > 0 
                  ? `${expandedComments.has(post.id) ? 'Hide' : 'View'} ${post.comments} comment${post.comments > 1 ? 's' : ''}`
                  : 'No comments yet'
                }
              </Button>

              {/* Comments Section */}
              {expandedComments.has(post.id) && (
                <div className="mt-3 space-y-3">
                  {/* Loading Comments */}
                  {loadingComments.has(post.id) && (
                    <div className="text-center py-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  )}

                  {/* Comments List */}
                  {postComments[post.id] && postComments[post.id].map((comment) => (
                    <div key={comment.id} className="flex space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        <img 
                          src={comment.userAvatar} 
                          alt={comment.userName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <p className="font-semibold text-xs">{comment.userName}</p>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{comment.timeAgo}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment */}
                  {currentUser && (
                    <div className="flex space-x-2 mt-3">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        <img 
                          src={currentUser.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80"} 
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex space-x-2">
                        <Input
                          placeholder="Add a comment..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs(prev => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))}
                          className="flex-1 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          disabled={submittingComment === post.id}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim() || submittingComment === post.id}
                          className="px-3"
                        >
                          {submittingComment === post.id ? (
                            <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Time */}
            <p className="text-gray-400 text-xs mt-3 uppercase">{post.timeAgo}</p>
          </CardContent>
        </Card>
      ))}
      
      {/* Load more button */}
      <div className="text-center py-4">
        <Button variant="outline" onClick={fetchPosts}>
          Refresh Posts
        </Button>
      </div>
    </div>
  );
};

export default Posts;
