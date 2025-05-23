import {
  generateToken,
  verifyToken,
  getUserFromToken,
  requireAuth,
} from "../utils/auth.js";
import User from "../models/user.js";
import { describe, expect, it, jest, beforeAll, afterAll } from "@jest/globals";
import { ObjectId } from "mongodb";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";

describe("Auth Utility Tests", () => {
  let testUser;
  let token;

  beforeAll(async () => {
    await setupDatabase();

    const username = `authuser_${Date.now()}`;
    const result = await User.register({
      name: "Auth Test User",
      username,
      password: "password123",
    });

    testUser = result.user;
    token = result.token;
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  it("should generate a valid JWT token", () => {
    const user = { _id: new ObjectId(), username: "testuser" };
    const generatedToken = generateToken(user);

    expect(typeof generatedToken).toBe("string");
    expect(generatedToken.split(".").length).toBe(3);
  });

  it("should verify a valid token", () => {
    const user = { _id: new ObjectId(), username: "testuser" };
    const generatedToken = generateToken(user);

    const decoded = verifyToken(generatedToken);
    expect(decoded).toBeDefined();
    expect(decoded._id.toString()).toBe(user._id.toString());
    expect(decoded.username).toBe(user.username);
  });

  it("should return null for an invalid token", () => {
    const invalidToken = "invalid.token.string";
    const decoded = verifyToken(invalidToken);

    expect(decoded).toBeNull();
  });

  it("should return null for a null token", () => {
    const decoded = verifyToken(null);
    expect(decoded).toBeNull();
  });

  it("should get a user from a valid token", async () => {
    const user = await getUserFromToken(token);

    expect(user).toBeDefined();
    expect(user._id.toString()).toBe(testUser._id.toString());
    expect(user.username).toBe(testUser.username);
  });

  it("should handle tokens with Bearer prefix", async () => {
    const bearerToken = `Bearer ${token}`;
    const user = await getUserFromToken(bearerToken);

    expect(user).toBeDefined();
    expect(user._id.toString()).toBe(testUser._id.toString());
  });

  it("should return null for an invalid token", async () => {
    const invalidToken = "invalid.token.string";
    const user = await getUserFromToken(invalidToken);

    expect(user).toBeNull();
  });

  it("should return null for a null token", async () => {
    const user = await getUserFromToken(null);
    expect(user).toBeNull();
  });

  it("should call the resolver when user is authenticated", () => {
    const mockResolver = jest.fn();
    const wrappedResolver = requireAuth(mockResolver);

    const parent = {};
    const args = {};
    const context = { user: testUser };
    const info = {};

    wrappedResolver(parent, args, context, info);

    expect(mockResolver).toHaveBeenCalledWith(parent, args, context, info);
  });

  it("should throw an error when user is not authenticated", () => {
    const mockResolver = jest.fn();
    const wrappedResolver = requireAuth(mockResolver);

    const parent = {};
    const args = {};
    const context = { user: null };
    const info = {};

    expect(() => {
      wrappedResolver(parent, args, context, info);
    }).toThrow("Authentication required");

    expect(mockResolver).not.toHaveBeenCalled();
  });
});
