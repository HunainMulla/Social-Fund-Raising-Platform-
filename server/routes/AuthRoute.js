const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/Db");


router.get("/all-users", async (req, res) => {
    const users = await User.find({});
    res.send(users);    
});

router.get("/all-campaigns", async (req, res) => {
    try {
        // Get all users with their campaigns
        const users = await User.find({ "campaigns.0": { $exists: true } }).select('name email mobile avatar campaigns');
        
        let allCampaigns = [];
        
        // Flatten campaigns from all users
        users.forEach(user => {
            if (user.campaigns && user.campaigns.length > 0) {
                user.campaigns.forEach(campaign => {
                    // Calculate days left (simplified calculation)
                    const endDate = new Date(campaign.endDate);
                    const currentDate = new Date();
                    const daysLeft = Math.max(0, Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)));
                    
                    allCampaigns.push({
                        id: campaign._id,
                        title: campaign.name,
                        description: campaign.description,
                        longDescription: campaign.description, // Using same description for now
                        image: campaign.image || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80",
                        additionalImages: [], // Not implemented yet
                        raised: campaign.currentAmount || 0,
                        goal: campaign.amount,
                        daysLeft: daysLeft,
                        location: campaign.location || "Location not specified",
                        category: campaign.category || "General",
                        backers: campaign.backers ? campaign.backers.length : 0, // Count actual backers
                        creator: {
                            name: user.name,
                            email: user.email,
                            phone: user.mobile || "Not provided",
                            avatar: user.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80",
                            joinedDate: "Member" // Simplified for now
                        },
                        startDate: campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "Not specified",
                        endDate: campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "Not specified"
                    });
                });
            }
        });
        
        // Sort by most recent (assuming _id contains timestamp info)
        allCampaigns.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
        
        res.status(200).json({ 
            campaigns: allCampaigns,
            total: allCampaigns.length
        });
    } catch (error) {
        console.error("Get all campaigns error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/signup", async (req, res) => {
    try {
        const {email, password, name, mobile, location, bio, avatar } = req.body;
        console.log("Signup request body:", req.body);
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user with all fields
        const newUser = await User.create({ 
            email, 
            password: hashedPassword, 
            name,
            mobile: mobile || "",
            location: location || "",
            bio: bio || "",
            avatar: avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80"
        });
        
        // Generate JWT token using the new user's email
        const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET);
        console.log("Token generated:", token);
        res.status(201).json({ 
            message: "User created successfully", 
            token: token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                mobile: newUser.mobile,
                location: newUser.location,
                bio: newUser.bio,
                avatar: newUser.avatar
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login request body:", req.body);
        console.log("User email and password = ", email, password);
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        
        const token = jwt.sign({ email: user.email,admin:user.isAdmin }, process.env.JWT_SECRET);
        res.status(200).json({ 
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                location: user.location,
                bio: user.bio,
                avatar: user.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80",
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/logout", (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
});

router.get("/delete", async (req, res) => {
    await User.deleteMany({});
    res.send("All users deleted");
});

router.get("/test", (req, res) => {
    res.send("Hello World");
});

router.post("/add-campaign", async (req, res) => {
    try {
        const { name, description, amount, currentAmount, image, startDate, endDate, category, location } = req.body;
        
        // Get user from token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create new campaign object
        const newCampaign = {
            name,
            description,
            amount,
            currentAmount: currentAmount || 0,
            image,
            startDate,
            endDate,
            category,
            location
        };

        // Add campaign to user's campaigns array
        user.campaigns.push(newCampaign);
        await user.save();

        res.status(201).json({ 
            message: "Campaign added successfully", 
            campaign: newCampaign,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                location: user.location,
                bio: user.bio,
                avatar: user.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80",
                campaigns: user.campaigns
            }
        });
    } catch (error) {
        console.error("Add campaign error:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/user-campaigns", async (req, res) => {
    try {
        // Get user from token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Format user's campaigns for frontend
        const userCampaigns = user.campaigns.map(campaign => {
            // Calculate days left
            const endDate = new Date(campaign.endDate);
            const currentDate = new Date();
            const daysLeft = Math.max(0, Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)));
            
            return {
                id: campaign._id,
                title: campaign.name,
                description: campaign.description,
                longDescription: campaign.description,
                image: campaign.image || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80",
                additionalImages: [],
                raised: campaign.currentAmount || 0,
                goal: campaign.amount,
                daysLeft: daysLeft,
                location: campaign.location || "Location not specified",
                category: campaign.category || "General",
                backers: campaign.backers ? campaign.backers.length : 0, // Count actual backers
                creator: {
                    name: user.name,
                    email: user.email,
                    phone: user.mobile || "Not provided",
                    avatar: user.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80",
                    joinedDate: "Member"
                },
                startDate: campaign.startDate || new Date().toISOString(),
                endDate: campaign.endDate || new Date().toISOString()
            };
        });

        res.status(200).json({ 
            campaigns: userCampaigns,
            total: userCampaigns.length
        });
    } catch (error) {
        console.error("Get user campaigns error:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/delete-campaign/:campaignId", async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        // Get user from token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the campaign to delete
        const campaignIndex = user.campaigns.findIndex(
            (campaign) => campaign._id.toString() === campaignId
        );

        if (campaignIndex === -1) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        // Remove campaign from user's campaigns array
        user.campaigns.splice(campaignIndex, 1);
        await user.save();

        res.status(200).json({ 
            message: "Campaign deleted successfully", 
            campaigns: user.campaigns
        });
    } catch (error) {
        console.error("Delete campaign error:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

// Password verification endpoint
router.post("/verify-password", async (req, res) => {
    try {
        const { password } = req.body;
        
        // Get user from token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        res.status(200).json({ message: "Password verified successfully" });
    } catch (error) {
        console.error("Password verification error:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

// Profile update endpoint
router.put("/update-profile", async (req, res) => {
    try {
        const { name, email, phone, location, bio } = req.body;
        
        // Get user from token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email already exists" });
            }
        }

        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.mobile = phone;
        if (location) user.location = location;
        if (bio) user.bio = bio;

        await user.save();

        res.status(200).json({ 
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                location: user.location,
                bio: user.bio,
                avatar: user.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80",
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error("Profile update error:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
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

// Admin route to get all users
router.get("/admin/users", requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        const formattedUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80",
            location: user.location || "Not specified",
            joinedDate: user.createdAt.toLocaleDateString(),
            campaignsCount: user.campaigns ? user.campaigns.length : 0,
            totalRaised: user.campaigns ? user.campaigns.reduce((total, campaign) => total + (campaign.currentAmount || 0), 0) : 0,
            isAdmin: user.isAdmin,
            status: "active"
        }));

        res.status(200).json({
            users: formattedUsers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total
            }
        });
    } catch (error) {
        console.error("Get admin users error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin route to get all campaigns
router.get("/admin/campaigns", requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({ "campaigns.0": { $exists: true } })
            .select('name email avatar campaigns');

        let allCampaigns = [];
        users.forEach(user => {
            user.campaigns.forEach(campaign => {
                const endDate = new Date(campaign.endDate);
                const currentDate = new Date();
                const daysLeft = Math.max(0, Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)));

                allCampaigns.push({
                    id: campaign._id,
                    title: campaign.name,
                    creator: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar
                    },
                    category: campaign.category,
                    raised: campaign.currentAmount || 0,
                    goal: campaign.amount,
                    daysLeft: daysLeft,
                    backers: campaign.backers ? campaign.backers.length : 0,
                    status: daysLeft > 0 ? "active" : "completed",
                    createdAt: campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "N/A",
                    location: campaign.location || "Not specified"
                });
            });
        });

        // Sort by creation date (newest first)
        allCampaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Apply pagination
        const paginatedCampaigns = allCampaigns.slice(skip, skip + limit);

        res.status(200).json({
            campaigns: paginatedCampaigns,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(allCampaigns.length / limit),
                totalCampaigns: allCampaigns.length
            }
        });
    } catch (error) {
        console.error("Get admin campaigns error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin route to delete any campaign
router.delete("/admin/campaigns/:userId/:campaignId", requireAdmin, async (req, res) => {
    try {
        const { userId, campaignId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const campaignIndex = user.campaigns.findIndex(
            (campaign) => campaign._id.toString() === campaignId
        );

        if (campaignIndex === -1) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        const campaignName = user.campaigns[campaignIndex].name;
        user.campaigns.splice(campaignIndex, 1);
        await user.save();

        res.status(200).json({ 
            message: `Campaign "${campaignName}" deleted successfully by admin`
        });
    } catch (error) {
        console.error("Admin delete campaign error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin route to suspend/activate user
router.patch("/admin/users/:userId/status", requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { action } = req.body; // 'suspend' or 'activate'

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // You might want to add a 'status' field to the user schema
        // For now, we'll just return success
        res.status(200).json({ 
            message: `User ${action === 'suspend' ? 'suspended' : 'activated'} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                status: action === 'suspend' ? 'suspended' : 'active'
            }
        });
    } catch (error) {
        console.error("Admin user status error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route to make a user admin (for testing purposes)
router.post("/make-admin", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isAdmin = true;
        await user.save();

        res.status(200).json({ 
            message: `User ${user.name} (${user.email}) is now an admin`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error("Make admin error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin route to delete any user
router.delete("/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Admin delete user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
