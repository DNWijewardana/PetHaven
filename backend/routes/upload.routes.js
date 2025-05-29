import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { uploadToCloudinary } from '../services/cloudinary.js';

const router = express.Router();

// Configure multer for memory storage (for Cloudinary uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Single file upload route
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file);
    
    // Return the secure URL from Cloudinary
    res.status(200).json({ 
      url: result.secure_url,
      public_id: result.public_id 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Error uploading file' });
  }
});

// Multiple files upload route
router.post('/multiple', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded or invalid file types' });
    }
    
    // Upload each file to Cloudinary
    const uploadPromises = req.files.map(file => uploadToCloudinary(file));
    const results = await Promise.all(uploadPromises);
    
    // Return array of secure URLs
    const urls = results.map(result => result.secure_url);
    res.status(200).json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Error uploading files' });
  }
});

export default router; 