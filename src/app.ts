
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
      // Connect MongoDB first
      await connectDB();

      // Initialize Better Auth after database connection
      const { getAuth } = await import("./auth/auth.js");
      const auth = await getAuth();

      const app = express();

      const allowedOrigins = new Set(
        [
          "http://localhost:3000",
          "https://helping-hands-client-five.vercel.app",
          process.env.CLIENT_URL,
        ].filter((origin): origin is string => Boolean(origin))
      );

      // CORS configuration
      app.use(
        cors({
          origin: (origin, callback) => {
            // Allow requests without an Origin header
            if (!origin || allowedOrigins.has(origin)) {
              return callback(null, true);
            }

            return callback(
              new Error(`CORS blocked this origin: ${origin}`)
            );
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

      // Parse JSON
      app.use(express.json());

      // Better Auth routes
      app.all("/api/auth/*any", toNodeHandler(auth));

      // Custom auth routes
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
