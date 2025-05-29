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

// Verify required credentials
if (!cloudinaryCredentials.cloud_name || !cloudinaryCredentials.api_key || !cloudinaryCredentials.api_secret) {
  console.error('❌ Missing Cloudinary credentials in upload service!');
}

// Configure Cloudinary
cloudinary.config(cloudinaryCredentials);

export const uploadImage = async (file) => {
  try {
    if (!file || !file.buffer) {
      throw new Error('Invalid file object received');
    }
    
    // Convert the file buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'paw-pal-reports'
    });

    console.log('Image uploaded successfully to Cloudinary:', {
      public_id: result.public_id,
      url: result.secure_url
    });

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary: ' + error.message);
  }
}; 