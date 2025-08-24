const express = require("express");
const router = express.Router();
const Post = require("../models/postModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Authentication error" });
    }
};

// Create a new post
router.post("/create", authenticateUser, async (req, res) => {
    try {
        const { title, content, image, category, tags } = req.body;
        
        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        // Create new post
        const newPost = new Post({
            title: title.trim(),
            content: content.trim(),
            image: image || "",
            author: req.user._id,
            authorName: req.user.name,
            authorAvatar: req.user.avatar,
            category: category || "General",
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
        });

        const savedPost = await newPost.save();

        res.status(201).json({
            message: "Post created successfully",
            post: savedPost
        });
    } catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all posts with pagination
router.get("/all", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        if (category && category !== "All") {
            query.category = category;
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name avatar')
            .lean();

        const total = await Post.countDocuments(query);

        // Format posts for frontend
        const formattedPosts = posts.map(post => ({
            id: post._id,
            title: post.title,
            content: post.content,
            image: post.image,
            authorName: post.authorName,
            authorAvatar: post.authorAvatar,
            category: post.category,
            tags: post.tags,
            likes: post.likes.length,
            comments: post.comments.length,
            createdAt: post.createdAt,
            timeAgo: getTimeAgo(post.createdAt)
        }));

        res.status(200).json({
            posts: formattedPosts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total,
                hasMore: page < Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get posts error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get posts by specific user
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Post.countDocuments({ author: userId });

        const formattedPosts = posts.map(post => ({
            id: post._id,
            title: post.title,
            content: post.content,
            image: post.image,
            authorName: post.authorName,
            authorAvatar: post.authorAvatar,
            category: post.category,
            tags: post.tags,
            likes: post.likes.length,
            comments: post.comments.length,
            createdAt: post.createdAt,
            timeAgo: getTimeAgo(post.createdAt)
        }));

        res.status(200).json({
            posts: formattedPosts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total,
                hasMore: page < Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get user posts error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Like/Unlike a post
router.post("/:postId/like", authenticateUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const likeIndex = post.likes.indexOf(userId);
        
        if (likeIndex > -1) {
            // Unlike the post
            post.likes.splice(likeIndex, 1);
        } else {
            // Like the post
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({
            message: likeIndex > -1 ? "Post unliked" : "Post liked",
            likes: post.likes.length,
            isLiked: likeIndex === -1
        });
    } catch (error) {
        console.error("Like post error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Add comment to a post
router.post("/:postId/comment", authenticateUser, async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const newComment = {
            user: req.user._id,
            userName: req.user.name,
            userAvatar: req.user.avatar,
            content: content.trim(),
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        res.status(201).json({
            message: "Comment added successfully",
            comment: newComment,
            totalComments: post.comments.length
        });
    } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get comments for a post
router.get("/:postId/comments", async (req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId).select('comments').lean();
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comments = post.comments.map(comment => ({
            id: comment._id,
            content: comment.content,
            userName: comment.userName,
            userAvatar: comment.userAvatar,
            createdAt: comment.createdAt,
            timeAgo: getTimeAgo(comment.createdAt)
        }));

        res.status(200).json({ comments });
    } catch (error) {
        console.error("Get comments error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a post (only by author)
router.delete("/:postId", authenticateUser, async (req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Delete post error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get community stats
router.get("/stats", async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        // Get total active posts (posts from last 30 days)
        const activePosts = await Post.countDocuments({ 
            createdAt: { $gte: startOfMonth }
        });

        // Get active users (users who posted in last 30 days)
        const activeUserIds = await Post.distinct('author', { 
            createdAt: { $gte: startOfMonth }
        });
        const activeUsers = activeUserIds.length;

        // Get posts this month
        const postsThisMonth = await Post.countDocuments({ 
            createdAt: { $gte: startOfMonth }
        });

        // Get total posts
        const totalPosts = await Post.countDocuments();

        // Get total users
        const totalUsers = await User.countDocuments();

        // Get category breakdown
        const categoryStats = await Post.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        res.status(200).json({
            activePosts,
            activeUsers,
            postsThisMonth,
            totalPosts,
            totalUsers,
            categoryStats: categoryStats.map(cat => ({
                category: cat._id,
                count: cat.count
            }))
        });
    } catch (error) {
        console.error("Get stats error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Authentication error" });
    }
};

// Admin route to get all posts
router.get("/admin/all", requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        if (category && category !== "All") {
            query.category = category;
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name avatar email')
            .lean();

        const total = await Post.countDocuments(query);

        // Format posts for admin panel
        const formattedPosts = posts.map(post => ({
            id: post._id,
            title: post.title,
            content: post.content.substring(0, 100) + "...", // Truncate for admin view
            image: post.image,
            authorName: post.authorName,
            authorEmail: post.author?.email,
            authorAvatar: post.authorAvatar,
            category: post.category,
            tags: post.tags,
            likes: post.likes.length,
            comments: post.comments.length,
            createdAt: post.createdAt,
            timeAgo: getTimeAgo(post.createdAt),
            status: "active"
        }));

        res.status(200).json({
            posts: formattedPosts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total,
                hasMore: page < Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get admin posts error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin route to delete any post
router.delete("/admin/:postId", requireAdmin, async (req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const postTitle = post.title;
        await Post.findByIdAndDelete(postId);

        res.status(200).json({ 
            message: `Post "${postTitle}" deleted successfully by admin`
        });
    } catch (error) {
        console.error("Admin delete post error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

module.exports = router; 