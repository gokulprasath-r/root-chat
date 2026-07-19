import mongoose from "mongoose";
import { env } from "./env";

// Opens the MongoDB connection. Called once during startup. If it fails we throw
// so the caller (server.ts) can decide how loud to be about it.
export async function connectDB(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}
