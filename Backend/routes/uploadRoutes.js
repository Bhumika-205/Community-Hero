// Backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Use memory storage — we stream the buffer to Cloudinary, no disk writes needed
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed.'));
        }
        cb(null, true);
    },
});

// POST /api/upload
// Accepts a single image field named "image", streams it to Cloudinary,
// and returns the secure URL.
router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file provided.' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
        {
            folder: 'community-hero',      // organises uploads in Cloudinary dashboard
            resource_type: 'image',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' }, // auto-optimise
                { width: 1200, crop: 'limit' },             // cap width
            ],
        },
        (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).json({ message: 'Image upload failed.', error: error.message });
            }
            res.status(200).json({ url: result.secure_url });
        }
    );

    // Pipe the in-memory buffer into the Cloudinary upload stream
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

module.exports = router;