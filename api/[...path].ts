import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApp } from "../src/app.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error("Vercel API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}