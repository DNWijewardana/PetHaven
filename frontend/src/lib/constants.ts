export const BASE_URL = 'http://localhost:4000';

export const POST_CATEGORIES = {
  GENERAL: 'GENERAL',
  LOST_PETS: 'LOST_PETS',
  FOUND_PETS: 'FOUND_PETS',
  ADOPTION: 'ADOPTION',
  VOLUNTEER: 'VOLUNTEER',
  HELP: 'HELP',
  SUCCESS_STORIES: 'SUCCESS_STORIES'
} as const;

export const API_ENDPOINTS = {
  BASE_URL: BASE_URL,
  POSTS: `${BASE_URL}/api/v1/posts`,
  UPLOAD: `${BASE_URL}/api/v1/upload`,
  AUTH: `${BASE_URL}/api/v1/auth`,
  USERS: `${BASE_URL}/api/v1/user`,
  PETS: `${BASE_URL}/api/v1/pets`,
  VET_CLINICS: `${BASE_URL}/api/v1/vet-clinics`,
  PRODUCTS: `${BASE_URL}/api/v1/products`,
  CART: `${BASE_URL}/api/v1/cart`,
  MEDICAL_GUIDES: `${BASE_URL}/api/v1/medical-guides`,
  VERIFICATIONS: `${BASE_URL}/api/v1/verifications`,
  CHATBOT: `${BASE_URL}/api/v1/chatbot`,
  PET_PROFILES: `${BASE_URL}/api/v1/pet-profiles`,
  REPORTS: `${BASE_URL}/api/v1/reports`,
  ADMIN: `${BASE_URL}/api/v1/admin`
} as const; 