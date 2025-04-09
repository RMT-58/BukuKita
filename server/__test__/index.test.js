import request from "supertest";
import { startTestServer, stopTestServer } from "../test-utils.js";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import { createApolloServer } from "../index.js";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";

describe("Server & Index Tests", () => {
  describe("Apollo Server Creation", () => {
    let server;
    let httpServer;
    let directUrl;

    beforeAll(async () => {
      const result = await createApolloServer({ port: 0 });
      server = result.server;
      httpServer = result.httpServer;
      directUrl = result.url;
    });

    afterAll(async () => {
      if (httpServer) {
        await new Promise((resolve) => httpServer.close(resolve));
      }
      if (server) {
        await server.stop();
      }
    });

    it("should create an Apollo server", () => {
      expect(server).toBeDefined();
      expect(httpServer).toBeDefined();
      expect(directUrl).toBeDefined();
      expect(directUrl).toContain("http://localhost:");
    });

    it("should have the correct URL format", () => {
      const urlRegex = /^http:\/\/localhost:\d+$/;
      expect(directUrl).toMatch(urlRegex);
    });
  });

  describe("Server API Tests", () => {
    let url;

    beforeAll(async () => {
      await setupDatabase();
      const { url: serverUrl } = await startTestServer();
      url = serverUrl;
    });

    afterAll(async () => {
      await stopTestServer();
      await teardownDatabase();
    });

    it("should return a welcome message on the root endpoint", async () => {
      const response = await request(url).get("/");
      expect(response.status).toBe(200);
      expect(response.text).toContain("BukuKita API Server");
    });

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

    it("should include CORS headers in the response", async () => {
      const response = await request(url).get("/");
      expect(response.headers["access-control-allow-origin"]).toBe("*");
    });

    it("should handle GraphQL errors properly", async () => {
      const invalidQuery = {
        query: `
          query {
            nonExistentField
          }
        `,
      };

      const response = await request(url).post("/graphql").send(invalidQuery);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});
