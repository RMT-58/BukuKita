import request from "supertest";
import { startTestServer, stopTestServer } from "../test-utils.js";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import { createApolloServer } from "../index.js";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";

describe("Server & Index Tests", () => {
  // First test suite: Direct Apollo Server Creation
  describe("Apollo Server Creation", () => {
    let server;
    let httpServer;
    let directUrl;

    // Before all tests, start the server directly
    beforeAll(async () => {
      const result = await createApolloServer({ port: 0 });
      server = result.server;
      httpServer = result.httpServer;
      directUrl = result.url;
    });

    // After all tests, stop the server
    afterAll(async () => {
      if (httpServer) {
        await new Promise((resolve) => httpServer.close(resolve));
      }
      if (server) {
        await server.stop();
      }
    });

    // Test server creation
    it("should create an Apollo server", () => {
      expect(server).toBeDefined();
      expect(httpServer).toBeDefined();
      expect(directUrl).toBeDefined();
      expect(directUrl).toContain("http://localhost:");
    });

    // Test server URL
    it("should have the correct URL format", () => {
      const urlRegex = /^http:\/\/localhost:\d+$/;
      expect(directUrl).toMatch(urlRegex);
    });
  });

  // Second test suite: API functionality using test server
  describe("Server API Tests", () => {
    let url;

    // Before all tests, set up the database and start the server using test utils
    beforeAll(async () => {
      await setupDatabase();
      const { url: serverUrl } = await startTestServer();
      url = serverUrl;
    });

    // After all tests, stop the server and tear down the database
    afterAll(async () => {
      await stopTestServer();
      await teardownDatabase();
    });

    // Test the root endpoint
    it("should return a welcome message on the root endpoint", async () => {
      const response = await request(url).get("/");
      expect(response.status).toBe(200);
      expect(response.text).toContain("BukuKita API Server");
    });

    // Test the GraphQL endpoint with a simple query
    it("should respond to a simple GraphQL query", async () => {
      const query = {
        query: `
          query {
            __schema {
              types {
                name
              }
            }
          }
        `,
      };

      const response = await request(url).post("/graphql").send(query);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    // Test CORS headers
    it("should include CORS headers in the response", async () => {
      const response = await request(url).get("/");
      expect(response.headers["access-control-allow-origin"]).toBe("*");
    });

    // Test error handling in GraphQL
    it("should handle GraphQL errors properly", async () => {
      const invalidQuery = {
        query: `
          query {
            nonExistentField
          }
        `,
      };

      const response = await request(url).post("/graphql").send(invalidQuery);
      // GraphQL validation errors return 400 status code
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});
