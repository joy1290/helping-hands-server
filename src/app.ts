import authRoutes from "./routes/auth.routes.js";
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

      const { auth } = await import("./auth/auth.js");

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
          methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
          allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Cookie",
          ],
        })
      );

      app.all("/api/auth/*any", toNodeHandler(auth));

      app.use(express.json());
      app.use("/api/events", eventRoutes);
      app.use("/api/auth-custom", authRoutes);

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
