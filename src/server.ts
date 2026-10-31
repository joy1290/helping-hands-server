
import dotenv from "dotenv";
import { getApp } from "./app.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    const app = await getApp();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("HelpingHands API is ready!");
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
