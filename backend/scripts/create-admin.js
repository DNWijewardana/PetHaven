#!/usr/bin/env node

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import readline from 'readline';

dotenv.config();

// Create readline interface for command line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

async function findUserByEmail(email) {
  try {
    return await User.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

async function makeUserAdmin(email) {
  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      return false;
    }
    
    user.isAdmin = true;
    await user.save();
    
    console.log(`\nSuccess! ${user.name} (${user.email}) is now an admin.`);
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
}

async function listAdmins() {
  try {
    const admins = await User.find({ isAdmin: true }, 'name email');
    
    if (admins.length === 0) {
      console.log('\nNo admin users found in the system.');
    } else {
      console.log('\nCurrent admin users:');
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email})`);
      });
    }
  } catch (error) {
    console.error('Error listing admins:', error);
  }
}

async function main() {
  try {
    await connectToDatabase();
    
    console.log('=========================================');
    console.log('PetHaven Admin Management Tool');
    console.log('=========================================\n');
    
    await listAdmins();
    
    rl.question('\nEnter the email of the user to make admin: ', async (email) => {
      if (!email || !email.includes('@')) {
        console.error('Invalid email address');
        rl.close();
        return;
      }
      
      const success = await makeUserAdmin(email);
      
      if (success) {
        await listAdmins();
      }
      
      rl.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Unhandled error:', error);
    rl.close();
    process.exit(1);
  }
}

// Start the script
main(); 