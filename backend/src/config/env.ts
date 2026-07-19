import dotenv from "dotenv";

// Load variables from `.env` into process.env once, at import time.
dotenv.config();

// Read everything through this object rather than touching process.env all over
// the codebase. Keeps defaults in one place and makes missing values obvious.
export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/root",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  // Secret used to sign JWTs. Must be set in production; the fallback only
  // exists so local dev works out of the box.
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // Cloudinary is configured separately in config/cloudinary.ts, read straight
  // from process.env.
};

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production");
}
