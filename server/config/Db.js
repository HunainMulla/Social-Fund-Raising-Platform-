const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();



const connectDB = async () => { 
    const MONGO_URI = process.env.MONGO_URI;
    
    console.log("This is the mongo uri = ",MONGO_URI);
    try { 
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) { 
        console.error("MongoDB connection failed:", error);
    }
}

connectDB();

module.exports = connectDB;
