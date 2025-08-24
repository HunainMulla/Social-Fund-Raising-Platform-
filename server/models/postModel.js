const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    authorAvatar: {
        type: String,
        default: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80"
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        userName: String,
        userAvatar: String,
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        default: "General"
    }
}, {
    timestamps: true
});

// Index for better query performance
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ category: 1 });

module.exports = mongoose.model("Post", postSchema); 