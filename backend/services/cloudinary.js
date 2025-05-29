import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate Cloudinary credentials are available
const cloudinaryCredentials = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

// Log Cloudinary configuration for debugging (without exposing secrets)
console.log('Cloudinary Configuration:', {
  cloud_name: cloudinaryCredentials.cloud_name,
  api_key: cloudinaryCredentials.api_key ? '[API_KEY_PRESENT]' : '[API_KEY_MISSING]',
  api_secret: cloudinaryCredentials.api_secret ? '[API_SECRET_PRESENT]' : '[API_SECRET_MISSING]'
});

// Verify required credentials
if (!cloudinaryCredentials.cloud_name || !cloudinaryCredentials.api_key || !cloudinaryCredentials.api_secret) {
  console.error('❌ Missing Cloudinary credentials in environment variables!');
}

// Configure Cloudinary
cloudinary.config(cloudinaryCredentials);

export const uploadToCloudinary = async (file) => {
  try {
    // Convert buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'paw-pal-reports',
    });

    console.log('Successfully uploaded to Cloudinary:', {
      public_id: result.public_id,
      url: result.secure_url
    });

    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}; 