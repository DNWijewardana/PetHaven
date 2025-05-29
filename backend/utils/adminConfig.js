import dotenv from 'dotenv';
dotenv.config();

// Get admin emails from environment variable or use default if not set
const adminEmails = process.env.ADMIN_EMAILS ? 
  process.env.ADMIN_EMAILS.split(',').map(email => email.trim()) :
  ['sanuka23thamudithaalles@gmail.com', 'ruwanthacbandara@gmail.com', 'dimalkanavod.yt@gmail.com'];

/**
 * Check if an email belongs to an admin
 * @param {string} email - The email to check
 * @returns {boolean} - True if the email belongs to an admin
 */
export const isAdminEmail = (email) => {
  return email && adminEmails.includes(email.toLowerCase());
};

/**
 * Get list of admin emails
 * @returns {string[]} - Array of admin email addresses
 */
export const getAdminEmails = () => {
  return [...adminEmails];
};

/**
 * Add a new admin email
 * @param {string} email - Email to add as admin
 * @returns {boolean} - True if email was added, false if it already exists
 */
export const addAdminEmail = (email) => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  if (adminEmails.includes(normalizedEmail)) return false;
  adminEmails.push(normalizedEmail);
  return true;
};

/**
 * Remove an admin email
 * @param {string} email - Email to remove from admin list
 * @returns {boolean} - True if email was removed, false if it wasn't found
 */
export const removeAdminEmail = (email) => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  const index = adminEmails.indexOf(normalizedEmail);
  if (index === -1) return false;
  adminEmails.splice(index, 1);
  return true;
}; 