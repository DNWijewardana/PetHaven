import VetClinic from '../models/VetClinic.js';
import { ApiError } from '../utils/ApiError.js';
import axios from 'axios';

/**
 * Create a new vet clinic
 */
const createVetClinic = async (req, res, next) => {
  try {
    const { name, address, coordinates, phoneNumber, email, website, services, operatingHours } = req.body;

    if (!name || !address || !coordinates) {
      return next(new ApiError(400, 'Name, address, and coordinates are required'));
    }

    // Ensure coordinates are in the correct format [longitude, latitude]
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return next(new ApiError(400, 'Coordinates must be an array with longitude and latitude'));
    }

    const newVetClinic = new VetClinic({
      name,
      address,
      location: {
        type: 'Point',
        coordinates
      },
      phoneNumber,
      email,
      website,
      services: services || [],
      operatingHours: operatingHours || {},
    });

    const savedClinic = await newVetClinic.save();
    res.status(201).json({
      success: true,
      data: savedClinic
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

/**
 * Get all vet clinics with optional filtering
 */
const getAllVetClinics = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, service } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filter = {};
    if (service) {
      filter.services = { $in: [service] };
    }
    
    const clinics = await VetClinic.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await VetClinic.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: clinics,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

/**
 * Get a vet clinic by ID
 */
const getVetClinicById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinic = await VetClinic.findById(id);
    
    if (!clinic) {
      return next(new ApiError(404, 'Vet clinic not found'));
    }
    
    res.status(200).json({
      success: true,
      data: clinic
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

/**
 * Update a vet clinic
 */
const updateVetClinic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Handle coordinates update if provided
    if (updateData.coordinates) {
      updateData.location = {
        type: 'Point',
        coordinates: updateData.coordinates
      };
      delete updateData.coordinates;
    }
    
    const updatedClinic = await VetClinic.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedClinic) {
      return next(new ApiError(404, 'Vet clinic not found'));
    }
    
    res.status(200).json({
      success: true,
      data: updatedClinic
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

/**
 * Delete a vet clinic
 */
const deleteVetClinic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedClinic = await VetClinic.findByIdAndDelete(id);
    
    if (!deletedClinic) {
      return next(new ApiError(404, 'Vet clinic not found'));
    }
    
    res.status(200).json({
      success: true,
      message: 'Vet clinic deleted successfully'
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

/**
 * Find nearby vet clinics based on coordinates
 */
const findNearbyVetClinics = async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query; // maxDistance in meters
    
    if (!latitude || !longitude) {
      return next(new ApiError(400, 'Latitude and longitude are required'));
    }
    
    // Find clinics within the specified radius
    const nearbyClinics = await VetClinic.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(20);
    
    res.status(200).json({
      success: true,
      data: nearbyClinics
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

/**
 * Find nearby vet clinics using Google Places API
 */
const findNearbyVetClinicsGoogle = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // radius in meters
    
    if (!latitude || !longitude) {
      return next(new ApiError(400, 'Latitude and longitude are required'));
    }
    
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return next(new ApiError(500, 'Google Maps API key is not configured'));
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=veterinary_care&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      return next(new ApiError(500, 'Failed to fetch data from Google Places API'));
    }
    
    const places = response.data.results.map(place => ({
      name: place.name,
      address: place.vicinity,
      googlePlaceId: place.place_id,
      location: {
        type: 'Point',
        coordinates: [place.geometry.location.lng, place.geometry.location.lat]
      },
      rating: place.rating,
      googleData: place
    }));
    
    res.status(200).json({
      success: true,
      data: places
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

/**
 * Get details of a vet clinic from Google Places API
 */
const getVetClinicDetailsGoogle = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    
    if (!placeId) {
      return next(new ApiError(400, 'Place ID is required'));
    }
    
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return next(new ApiError(500, 'Google Maps API key is not configured'));
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,formatted_phone_number,geometry,website,opening_hours,photos&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      return next(new ApiError(500, 'Failed to fetch data from Google Places API'));
    }
    
    res.status(200).json({
      success: true,
      data: response.data.result
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export {
  createVetClinic,
  getAllVetClinics,
  getVetClinicById,
  updateVetClinic,
  deleteVetClinic,
  findNearbyVetClinics,
  findNearbyVetClinicsGoogle,
  getVetClinicDetailsGoogle
}; 