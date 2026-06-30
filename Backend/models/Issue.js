const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  

  category: { type: String, default: 'General' }, 
  suggestedAction: { type: String }, // AI generated instant fix recommendation
  status: { type: String, enum: ['Reported', 'Pending','Verified', 'In Progress', 'Resolved'], default: 'Reported' },
  upvotes: { type: Number, default : 0}, 
  // ----------------------------------------
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', issueSchema);