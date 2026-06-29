const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  
  // --- NEW HACKATHON EVALUATION FIELDS ---
  category: { type: String, default: 'General' }, 
  suggestedAction: { type: String }, // AI generated instant fix recommendation
  status: { type: String, enum: ['Reported', 'Verified', 'In-Progress', 'Resolved'], default: 'Reported' },
  upvotes: [{ type: String }], // Array of user IPs or user IDs to validate the issue
  // ----------------------------------------
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', issueSchema);