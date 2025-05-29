import express from 'express';
import multer from 'multer';
import Report from '../models/Report.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
});

// Create a new report
router.post('/', isAuthenticated, upload.array('images', 5), async (req, res) => {
  try {
    const { type, animalType, description, location, contactInfo } = req.body;
    
    // Parse location data
    let parsedLocation;
    try {
      // If location is a string (from JSON), parse it
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      
      // Ensure coordinates are numbers
      if (!parsedLocation?.coordinates || 
          !Array.isArray(parsedLocation.coordinates) || 
          parsedLocation.coordinates.length !== 2 ||
          typeof parsedLocation.coordinates[0] !== 'number' ||
          typeof parsedLocation.coordinates[1] !== 'number') {
        throw new Error('Invalid coordinates format');
      }
    } catch (error) {
      console.error('Location parsing error:', error);
      return res.status(400).json({ error: 'Invalid location data format' });
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file);
        imageUrls.push(result.secure_url);
      }
    }

    // Create report with location as GeoJSON Point
    const report = new Report({
      type,
      animalType,
      description,
      location: {
        type: 'Point',
        coordinates: parsedLocation.coordinates,
        address: parsedLocation.address || ''
      },
      images: imageUrls.length > 0 ? imageUrls : req.body.images,
      contactInfo,
      createdBy: req.user.sub || req.user._id // Use Auth0 user ID (sub)
    });

    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, error: 'Failed to create report' });
  }
});

// Get reports near a location
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters, default 10km

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      status: 'ACTIVE'
    })
    .sort('-createdAt')
    .limit(50);

    res.json(reports);
  } catch (error) {
    console.error('Error fetching nearby reports:', error);
    res.status(500).json({ error: 'Failed to fetch nearby reports' });
  }
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    const { type, status = 'ACTIVE' } = req.query;
    const query = { status };
    
    if (type) {
      query.type = type;
    }

    const reports = await Report.find(query)
      .sort('-createdAt')
      .limit(50);

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get a single report
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Update report status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
});

// Update a report
router.put('/:id', async (req, res) => {
  try {
    const { type, animalType, description, location, images } = req.body;
    
    // Validate location data
    if (!location?.coordinates || 
        !Array.isArray(location.coordinates) || 
        location.coordinates.length !== 2 ||
        typeof location.coordinates[0] !== 'number' ||
        typeof location.coordinates[1] !== 'number') {
      return res.status(400).json({ error: 'Invalid location data' });
    }

    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Update report
    report.type = type;
    report.animalType = animalType;
    report.description = description;
    report.location = location;
    report.images = images;
    report.updatedAt = Date.now();

    await report.save();
    res.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Get all reports for a specific user
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.sub || req.user._id;
    
    const reports = await Report.find({ createdBy: userId })
      .sort('-createdAt');

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user reports' });
  }
});

export default router; 