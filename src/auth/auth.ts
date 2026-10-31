
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { getDB } from "../config/db.js";

export const auth = betterAuth({
    
  database: mongodbAdapter(getDB()),

  baseURL: process.env.BETTER_AUTH_URL,

  secret: process.env.BETTER_AUTH_SECRET,
advanced: {
  defaultCookieAttributes: {
    sameSite: "none",
    secure: true,
    httpOnly: true,
  },
},

 trustedOrigins: [
  process.env.CLIENT_URL!,
  "http://localhost:3000",
],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
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
