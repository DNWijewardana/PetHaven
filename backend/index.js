import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import fs from "fs";
import connectDB from "./db/connect.js";
import uploadRoutes from "./routes/upload.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import forumRoutes from './routes/forum.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { ApiError } from './utils/ApiError.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import petsRoutes from './routes/pets.routes.js';
import vetClinicRouter from './routes/vetClinic.routes.js';
import productRoutes from './routes/product.routes.js';
import medicalGuideRoutes from './routes/medicalGuide.routes.js';
import verificationRoutes from './routes/verification.routes.js';
import donationRoutes from './routes/donation.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import userPetProfileRoutes from './routes/userPetProfile.routes.js';
import adminRoutes from './routes/admin.js';

// Defensive programming technique for checking if all required environment variables are defined
const requiredEnvVars = [
  "PORT", 
  "MONGODB_URI", 
  "CLIENT_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(
      `❌ ${envVar} is not defined. Please add it to your .env file.`
    );
    process.exit(1);
  }
}, console.log("✅ All required environment variables are defined."));

const PORT = process.env.PORT;
const app = express();

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Register routes
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use('/api/v1/forum', forumRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/pets', petsRoutes);
app.use('/api/v1/vet-clinics', vetClinicRouter);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/medical-guides', medicalGuideRoutes);
app.use('/api/v1/verifications', verificationRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/pet-profiles', userPetProfileRoutes);
app.use('/api/v1/admin', adminRoutes);

// Load other routes dynamically
const routerFiles = fs.readdirSync("./routes");
routerFiles.forEach((file) => {
  if (file !== 'upload.routes.js' && file !== 'reports.js' && file !== 'forum.js' && 
      file !== 'post.routes.js' && file !== 'user.routes.js' && file !== 'pets.routes.js' && 
      file !== 'vetClinic.routes.js' && file !== 'product.routes.js' && file !== 'chatbot.routes.js') {
    import(`./routes/${file}`)
      .then((route) => {
        app.use("/api/v1/", route.default);
      })
      .catch((error) => {
        console.error("Error importing route: ", error);
      });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "👋 Hello From PetHaven API" });
});

// Handle 404 routes
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Error handling middleware
app.use(errorHandler);

const server = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
    await connectDB();
  } catch (error) {
    console.error("Server Error: ", error);
    process.exit(1);
  }
};

server();
