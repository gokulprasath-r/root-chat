import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import conversationRoutes from "./routes/conversationRoutes";

// Build and configure the Express app. Kept separate from server.ts so the app
// can be imported in tests without actually binding to a port.
const app = express();

// During development the Next.js dev server may land on 3000 or 3001 (whichever
// is free), so we allow any localhost origin plus the configured client URL.
const allowedOrigins = [env.clientUrl, "http://localhost:3000", "http://localhost:3001"];
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (no origin) and any of our known origins.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    // Required so the browser will send/receive the httpOnly auth cookie.
    credentials: true,
  }),
);

// Parse JSON request bodies into req.body, and cookies into req.cookies.
// The larger limit leaves room for base64 profile images.
app.use(express.json({ limit: "8mb" }));
app.use(cookieParser());

// Simple health check so we can confirm the server is up.
app.get("/", (_req, res) => {
  res.json({ message: "Root API is running" });
});

// API routes.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);

export default app;
