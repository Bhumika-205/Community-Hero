// Backend/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const issueRoutes  = require('./routes/issueRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/issues', issueRoutes);
app.use('/api/upload', uploadRoutes);  // ← Cloudinary image upload

// Health check
app.get('/', (req, res) => {
    res.send('Community Hero API is active.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));