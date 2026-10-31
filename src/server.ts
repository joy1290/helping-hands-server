
import eventRoutes from "./routes/event.routes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { toNodeHandler } from "better-auth/node";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

async function startServer() {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Load Better Auth
    const { auth } = await import("./auth/auth.js");

    // 3. Register Better Auth route
    app.all("/api/auth/*any", toNodeHandler(auth));

    // 4. Other middleware
    app.use(express.json());
    app.use("/api/events", eventRoutes);

    app.get("/", (_req, res) => {
      res.json({
        success: true,
        message: "HelpingHands API is running!",
      });
    });

    console.log("PORT:", PORT);
console.log("BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
    // 5. Start server
    app.listen(PORT, async () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("Better Auth is ready!");

      // 6. Check JWKS endpoint
      try {
const jwksURL = new URL(
  "/api/auth/jwks",
  process.env.BETTER_AUTH_URL
);

console.log("JWKS URL:", jwksURL.toString());

const response = await fetch(jwksURL);

console.log("JWKS Status:", response.status);
console.log("JWKS Response:", await response.text());
      } catch (error) {
        console.error("JWKS Fetch Error:", error);
      }
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
