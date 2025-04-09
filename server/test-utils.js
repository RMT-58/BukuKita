import { createApolloServer } from "./index.js";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// Global variables to store server and database connections
let mongoClient = null;
let testServer = null;
let testUrl = null;

/**
 * Initialize and start the test server
 * @returns {Promise<{server: any, url: string}>} The server and URL
 */
export async function startTestServer() {
  if (!testServer) {
    const { server, httpServer, url } = await createApolloServer({ port: 0 });
    testServer = { server, httpServer };
    testUrl = url;
  }
  return { server: testServer, url: testUrl };
}

/**
 * Stop the test server
 * @returns {Promise<void>}
 */
export async function stopTestServer() {
  if (testServer) {
    await testServer.server.stop();
    await new Promise((resolve) => testServer.httpServer.close(resolve));
    testServer = null;
    testUrl = null;
  }
}

/**
 * Connect to the test database
 * @returns {Promise<{client: MongoClient, db: any}>} MongoDB client and database
 */
export async function connectToTestDatabase() {
  if (!mongoClient) {
    const uri = process.env.MONGODB_URI;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
  }

  const testDbName = `${process.env.MONGODB_DATABASE}_test`;
  const db = mongoClient.db(testDbName);

  return { client: mongoClient, db };
}

/**
 * Disconnect from the test database
 * @returns {Promise<void>}
 */
export async function disconnectFromTestDatabase() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
}

/**
 * Clear all collections in the test database
 * @param {any} db - The database to clear
 * @returns {Promise<void>}
 */
export async function clearDatabase(db) {
  if (!db) return;

  const collections = await db.listCollections().toArray();
  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({});
  }
}
