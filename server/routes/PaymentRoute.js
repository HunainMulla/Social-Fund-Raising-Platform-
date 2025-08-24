const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// Create payment intent
router.post("/create-payment-intent", async (req, res) => {
    try {
        const { amount, campaignId, creatorEmail } = req.body;

        // Validate token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Verify campaign exists
        const creatorUser = await User.findOne({ email: creatorEmail });
        if (!creatorUser) {
            return res.status(400).json({ message: "Campaign creator not found" });
        }

        const campaign = creatorUser.campaigns.find(c => c._id.toString() === campaignId);
        if (!campaign) {
            return res.status(400).json({ message: "Campaign not found" });
        }

        // Prevent overpayment
        if ((campaign.currentAmount || 0) + amount > campaign.amount) {
            return res.status(400).json({ message: "This payment would exceed the campaign goal." });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
            currency: 'usd',
            metadata: {
                campaignId: campaignId,
                creatorEmail: creatorEmail,
                backerEmail: user.email,
                backerName: user.name,
                campaignName: campaign.name
            }
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error("Create payment intent error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Confirm payment and update campaign
router.post("/confirm-payment", async (req, res) => {
    try {
        const { paymentIntentId, campaignId, creatorEmail, amount, message } = req.body;

        // Validate token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Verify payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: "Payment not completed" });
        }

        // Find campaign creator and update campaign
        const creatorUser = await User.findOne({ email: creatorEmail });
        if (!creatorUser) {
            return res.status(400).json({ message: "Campaign creator not found" });
        }

        const campaign = creatorUser.campaigns.find(c => c._id.toString() === campaignId);
        if (!campaign) {
            return res.status(400).json({ message: "Campaign not found" });
        }

        // Update campaign's current amount
        campaign.currentAmount = (campaign.currentAmount || 0) + amount;

        // Add backer info to campaign (you might want to add a backers array to the schema)
        if (!campaign.backers) {
            campaign.backers = [];
        }
        
        campaign.backers.push({
            userId: user._id,
            name: user.name,
            email: user.email,
            amount: amount,
            message: message || "",
            date: new Date(),
            paymentIntentId: paymentIntentId
        });

        await creatorUser.save();

        res.status(200).json({
            message: "Payment successful and campaign updated!",
            updatedAmount: campaign.currentAmount,
            campaign: {
                id: campaign._id,
                name: campaign.name,
                currentAmount: campaign.currentAmount,
                goal: campaign.amount
            }
        });

    } catch (error) {
        console.error("Confirm payment error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Get campaign details for payment
router.get("/campaign/:campaignId/:creatorEmail", async (req, res) => {
    try {
        const { campaignId, creatorEmail } = req.params;

        // Find campaign creator
        const creatorUser = await User.findOne({ email: creatorEmail });
        if (!creatorUser) {
            return res.status(400).json({ message: "Campaign creator not found" });
        }

        const campaign = creatorUser.campaigns.find(c => c._id.toString() === campaignId);
        if (!campaign) {
            return res.status(400).json({ message: "Campaign not found" });
        }

        // Calculate days left
        const endDate = new Date(campaign.endDate);
        const currentDate = new Date();
        const daysLeft = Math.max(0, Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)));

        res.status(200).json({
            id: campaign._id,
            title: campaign.name,
            description: campaign.description,
            image: campaign.image || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
            category: campaign.category,
            goal: campaign.amount,
            raised: campaign.currentAmount || 0,
            daysLeft: daysLeft,
            backers: campaign.backers ? campaign.backers.length : 0,
            creator: {
                name: creatorUser.name,
                email: creatorUser.email,
                avatar: creatorUser.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80"
            }
        });

    } catch (error) {
        console.error("Get campaign details error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router; 