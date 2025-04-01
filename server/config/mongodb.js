import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db = null;

function connect() {
  try {
    db = client.db(process.env.MONGODB_DATABASE);
  } catch (err) {
    console.log(err);
  }
}

export function getDb() {
  if (!db) {
    connect();
  }
  return db;
}
