const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const db = require("../config/Db");


router.post("/create", async (req, res) => {
    const { name, description, amount, image, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    user.campaigns.push({ name, description, amount, image });
    await user.save();
    res.status(201).json({ message: "Campaign created successfully" });
});


router.post("/back", async (req, res) => {
    try {
      const { name, amount, token, creator } = req.body;
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
  
      // Find the campaign owner
      const creatorUser = await User.findOne({ email: creator });
      if (!creatorUser) {
        return res.status(400).json({ message: "Campaign creator not found" });
      }
  
      // Find the campaign inside that user's campaigns
      const campaign = creatorUser.campaigns.find(c => c.name === name);
      if (!campaign) {
        return res.status(400).json({ message: "Campaign not found" });
      }
  
      // Update currentAmount
      campaign.currentAmount += amount;
  
      await creatorUser.save();
  
      return res.status(200).json({
        message: "Donation successful",
        updatedAmt: campaign.currentAmount,
      });
  
    } catch (error) {
      console.error("Error in /back route:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  

module.exports = router;
