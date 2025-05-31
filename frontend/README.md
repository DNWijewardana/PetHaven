# Pet Shop Web Application - Frontend

This is the frontend of the Pet Shop web application built with React, TypeScript, and Vite.

## Features

- Browse and search for pets and pet products
- User authentication using Auth0
- Create and manage product listings
- Upload and manage product images
- Responsive design for mobile and desktop

## Technologies Used

- React 19
- TypeScript
- Vite
- Auth0 for authentication
- Tailwind CSS for styling
- Radix UI for component library
- Axios for API requests
- React Router for navigation
- React Hook Form for form handling
- Zod for form validation
- React Dropzone for file uploads

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
   ```bash
   cd frontend
   ```
3. Install dependencies
   ```bash
   npm install
   ```
   
### Environment Setup

Create a `.env` file in the root of the frontend directory with the following variables:

```
VITE_API_URL=http://localhost:5000
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=your-auth0-audience
```

### Dependency Conflicts

This project uses React 19, which may cause dependency conflicts with some packages that haven't been updated yet. If you encounter dependency conflicts when installing packages, use the following command:

```bash
npm install --legacy-peer-deps
```

For specifically adding new packages:

```bash
npm install [package-name] --legacy-peer-deps
```

The project is configured with a special `setup` script to automatically use this flag:

```bash
npm run setup
```

### Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

- `src/` - Main source code
  - `components/` - Reusable UI components
  - `pages/` - Application pages
  - `services/` - API service functions
  - `hooks/` - Custom React hooks
  - `utils/` - Utility functions
  - `contexts/` - React context providers
  - `types/` - TypeScript type definitions

## Deployment

The application can be deployed to Vercel or any other static hosting service.

```bash
npm run build
```

Then upload the contents of the `dist` directory to your hosting provider.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
