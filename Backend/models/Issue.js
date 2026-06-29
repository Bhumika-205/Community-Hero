// Backend/models/Issue.js
const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    // The category can start as "Uncategorized" and be updated by Gemini API
    category: { 
        type: String, 
        default: 'Uncategorized' 
    },
    severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Unknown'],
    default: 'Unknown'
    },
    priority : {
        type : Number,
        default : 0
    },
    department : {
        type : String
    },
    location: {
        latitude: {
            type: Number,
            default: 0
        },
        longitude: {
            type: Number,
            default: 0
        },
        address: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
    imageUrl: { 
        type: String 
    },
    upvotes: { 
        type: Number, 
        default: 0 
    },
    // Track unique verification attempts (could be user IDs or session hashes later)
    verifiedBy: [{ 
        type: String 
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Issue', IssueSchema);