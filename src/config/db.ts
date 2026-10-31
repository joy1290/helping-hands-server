
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing in .env file");
}

const client = new MongoClient(uri);

let database: Db;

export async function connectDB(): Promise<Db> {
  await client.connect();

  database = client.db("helping-hands");

  console.log("MongoDB connected successfully!");

  return database;
}

export function getDB(): Db {
  if (!database) {
    throw new Error("Database is not connected");
  }

  return database;
}
