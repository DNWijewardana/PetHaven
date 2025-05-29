import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

// Register or update user from Auth0
export async function registerUser(req, res) {
  try {
    const { name, email, picture, sub, isAdmin } = req.body;

    // Find existing user by Auth0 sub
    let user = await User.findOne({ sub });

    if (user) {
      // Update existing user
      user.name = name;
      user.email = email;
      user.picture = picture;
      user.isAdmin = isAdmin || user.isAdmin;
      await user.save();
      res.json({ message: 'User updated successfully', user });
    } else {
      // Create new user
      user = new User({
        name,
        email,
        picture,
        sub,
        isAdmin: isAdmin || false
      });
      await user.save();
      res.status(201).json({ message: 'User registered successfully', user });
    }
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ message: error.message });
  }
}

// Get user profile
export async function getProfile(req, res) {
  try {
    const { sub } = req.params;
    const user = await User.findOne({ sub });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    res.json(user);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

// Update user profile
export async function updateProfile(req, res) {
  try {
    const { sub } = req.params;
    const updates = req.body;
    
    const user = await User.findOne({ sub });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Only allow updating certain fields
    const allowedUpdates = ['name', 'picture'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        user[key] = updates[key];
      }
    });

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

// Promote user to admin or demote from admin
export async function updateAdminStatus(req, res) {
  try {
    const { email } = req.body;
    const { makeAdmin } = req.body;
    
    if (typeof email !== 'string' || !email) {
      throw new ApiError(400, 'Valid email is required');
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    
    // Update the isAdmin status based on the makeAdmin parameter
    user.isAdmin = makeAdmin === true;
    await user.save();
    
    return res.json({ 
      success: true, 
      message: `User ${makeAdmin ? 'promoted to' : 'demoted from'} admin successfully`,
      user: {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error updating admin status:', error);
    return res.status(error.statusCode || 500).json({ 
      success: false,
      message: error.message 
    });
  }
}

// Get all users (admin only)
export async function getAllUsers(req, res) {
  try {
    const users = await User.find({}, 'name email picture isAdmin createdAt');
    return res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
} 