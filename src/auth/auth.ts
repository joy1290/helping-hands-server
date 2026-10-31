
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { getDB } from "../config/db.js";

const baseURL =
  process.env.BETTER_AUTH_URL || "http://localhost:5000";

const clientURL =
  process.env.CLIENT_URL || "http://localhost:3000";

export const auth = betterAuth({
  database: mongodbAdapter(getDB()),

  baseURL,

  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: [
    "http://localhost:3000",
    "https://helping-hands-client-five.vercel.app",
    clientURL,
  ],

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
  },

  plugins: [jwt()],
});
