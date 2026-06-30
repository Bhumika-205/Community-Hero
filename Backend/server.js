// Backend/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path'); // <-- ADD THIS core node module
const connectDB = require('./config/db');

const issueRoutes  = require('./routes/issueRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/issues', issueRoutes);
app.use('/api/upload', uploadRoutes); 
app.use("/api/ai", aiRoutes);

// --- ADD THIS SECTION FOR PRODUCTION DEPLOYMENT ---
if (process.env.NODE_ENV === 'production' || true) { 
    // Serve static files from the public build directory
    app.use(express.static(path.join(__dirname, 'public')));

    // Catch-all route to handle React Router single-page app navigations
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
} else {
    // Health check fallback for local development testing
    app.get('/', (req, res) => {
        res.send('Community Hero API is active.');
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));