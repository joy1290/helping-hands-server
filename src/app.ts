import express, { type Express } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { connectDB } from "./config/db.js";
import eventRoutes from "./routes/event.routes.js";
import authRoutes from "./routes/auth.routes.js";

let appPromise: Promise<Express> | null = null;

export async function getApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = (async () => {
      // Connect to MongoDB before initializing Better Auth
      await connectDB();

      // Initialize Better Auth after database connection
      const { getAuth } = await import("./auth/auth.js");
      const auth = await getAuth();

      const app = express();

      const allowedOrigins = [
        "http://localhost:3000",
        "https://helping-hands-client-five.vercel.app",
        process.env.CLIENT_URL,
      ].filter((origin): origin is string => Boolean(origin));

      app.use(
        cors({
          origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error("Not allowed by CORS"));
            }
          },
          credentials: true,
          methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
          ],
          allowedHeaders: [
            "Content-Type",
            "Authorization",
          ],
        })
      );

      // Parse JSON request bodies
      app.use(express.json());

      // Better Auth endpoints
      app.all("/api/auth/*any", toNodeHandler(auth));

      // Custom authentication routes
      app.use("/api/auth-custom", authRoutes);

      // Event routes
      app.use("/api/events", eventRoutes);

      // Health check
      app.get("/", (_req, res) => {
        res.status(200).json({
          success: true,
          message: "HelpingHands API is running!",
        });
      });

      return app;
    })().catch((error) => {
      appPromise = null;
      throw error;
    });
  }

  return appPromise;
}