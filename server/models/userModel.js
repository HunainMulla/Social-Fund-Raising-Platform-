const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobile: String,
    avatar: String,
    location: String,
    bio: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    campaigns: [{
        name:{ 
            type: String,   
            required: true
        },
        description:{
            type: String,
            required: true
        },
        amount:{
            type: Number,
            required: true
        },
        currentAmount:{
            type: Number,
            required: true,
            default: 0
        },
        image:{
            type: String,
        },
        startDate:{
            type: Date,
            required: true
        },
        endDate:{
            type: Date,
            required: true
        },
        category:{
            type: String,
            required: true
        },
        location:{
            type: String,
            required: true  
        },
        backers: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            name: String,
            email: String,
            amount: Number,
            message: String,
            date: {
                type: Date,
                default: Date.now
            },
            paymentIntentId: String
        }]
    }]
});

module.exports = mongoose.model("User", userSchema);
