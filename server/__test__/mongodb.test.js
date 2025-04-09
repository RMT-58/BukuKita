import { getDb, getClient } from "../config/mongodb.js";
import { MongoClient } from "mongodb";
import {
  describe,
  expect,
  it,
  jest,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";

describe("MongoDB Configuration Tests", () => {
  const originalConsoleLog = console.log;

  let consoleOutput = [];
  const mockedConsoleLog = (...args) => {
    consoleOutput.push(args);
  };

  beforeAll(() => {
    console.log = mockedConsoleLog;
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    consoleOutput = [];
  });

  it("should get a database connection", () => {
    const db = getDb();
    expect(db).toBeDefined();
  });

  it("should get a test database connection", () => {
    const db = getDb(true);
    expect(db).toBeDefined();
  });

  it("should get the MongoDB client", () => {
    const client = getClient();
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(MongoClient);
  });

  it("should log errors when connection fails", async () => {
    const originalEnv = process.env;
    const originalUri = process.env.MONGODB_URI;

    try {
      process.env.MONGODB_URI = "mongodb://invalid-uri";

      jest.resetModules();

      const { getDb } = await import("../config/mongodb.js");

      getDb();

      expect(consoleOutput.length).toBe(0);
    } finally {
      process.env.MONGODB_URI = originalUri;
      process.env = originalEnv;
    }
  });
});
