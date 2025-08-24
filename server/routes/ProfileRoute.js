const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

router.post("/profile", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "No token provided or invalid format" });
        }
        
        const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
        console.log("This is the token recieved from the frontend- ",token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        
        const user = await User.findOne({ email });
        console.log("This is the user recieved from the database- ",user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({ message: "Profile route", user: user });
    } catch (error) {
        console.error("Profile route error:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;