# Pet Shop Web Application - Backend API

This is the backend API for the Pet Shop web application built with Express and MongoDB.

## Features

- RESTful API for pet shop application
- User authentication and authorization with Auth0
- CRUD operations for products, pets, and user profiles
- Image upload functionality with Cloudinary
- MongoDB database integration

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose ODM
- Auth0 for authentication
- Multer for file handling
- Cloudinary for image storage
- Zod for data validation
- Nodemailer for email functionality

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory
   ```bash
   cd backend
   ```
3. Install dependencies
   ```bash
   npm install
   ```

### Environment Setup

Create a `.env` file in the root of the backend directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/pet-shop
# or
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pet-shop

# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain
AUTH0_AUDIENCE=your-auth0-audience

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Running the Application

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- Auth is handled by Auth0

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Pets

- `GET /api/pets` - Get all pets
- `GET /api/pets/:id` - Get a specific pet
- `POST /api/pets` - Create a new pet
- `PUT /api/pets/:id` - Update a pet
- `DELETE /api/pets/:id` - Delete a pet

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Images

- `POST /api/upload/multiple` - Upload multiple images
- `POST /api/upload/single` - Upload a single image

## Project Structure

- `index.js` - Entry point
- `routes/` - API route definitions
- `controllers/` - Request handlers
- `models/` - Mongoose schema definitions
- `middleware/` - Custom middleware functions
- `utils/` - Utility functions
- `services/` - Business logic
- `db/` - Database connection

## Error Handling

The API follows a consistent error handling pattern:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 

## Admin Management

To create an admin user:

1. Make sure the user has registered in the application first
2. Run the admin creation script:
   ```
   node scripts/create-admin.js
   ```
3. Enter the email address of the user you want to promote to admin
4. The script will confirm that the user is now an admin

Alternatively, you can use the API endpoint to manage admins:

```
POST /api/v1/admin/update-admin-status
```

With the request body:
```json
{
  "email": "user@example.com",
  "makeAdmin": true
}
```

Note: Only existing admins can create new admins through the API. The script bypasses this restriction for initial setup. 