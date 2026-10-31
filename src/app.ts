
import express, { type Express } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { connectDB } from "./config/db.js";
import eventRoutes from "./routes/event.routes.js";

let appPromise: Promise<Express> | null = null;

export async function getApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = (async () => {
      await connectDB();

      // Import auth only after MongoDB is connected
      const { auth } = await import("./auth/auth.js");

      const app = express();

      const allowedOrigins = [
        "http://localhost:3000",
        process.env.CLIENT_URL,
      ].filter((origin): origin is string => Boolean(origin));

      app.use(
        cors({
          origin: allowedOrigins,
          credentials: true,
        })
      );

      app.all("/api/auth/*any", toNodeHandler(auth));

      app.use(express.json());
      app.use("/api/events", eventRoutes);

      app.get("/", (_req, res) => {
        res.json({
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
