
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing in .env file");
}

const client = new MongoClient(uri);

let database: Db | undefined;
let connectionPromise: Promise<Db> | null = null;

export async function connectDB(): Promise<Db> {
  if (database) return database;

  if (!connectionPromise) {
    connectionPromise = client.connect()
      .then(() => {
        database = client.db("helping-hands");
        console.log("MongoDB connected successfully!");
        return database;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

export function getDB(): Db {
  if (!database) {
    throw new Error("Database is not connected");
  }

  return database;
}
