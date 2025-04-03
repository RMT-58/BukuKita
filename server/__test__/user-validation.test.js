import { ObjectId } from "mongodb";
import User from "../models/user.js";
import { describe, expect, it, beforeAll } from "@jest/globals";
import { getDb } from "../config/mongodb.js";

describe("User Model Validation Tests", () => {
  let db;

  beforeAll(async () => {
    db = getDb(); // Get database connection
  });

  // ==================== USER MODEL VALIDATION TESTS ====================
  describe("User Registration Validation", () => {
    // Test validation for username uniqueness
    it("should fail to register a user with an existing username", async () => {
      // First create a user
      const username = `testuser_unique_${Date.now()}`;
      const user = await User.register({
        name: "Test User",
        username,
        password: "password123",
        phone_number: "1234567890",
        address: "123 Test St",
      });

      // Now try to register another user with the same username
      try {
        await User.register({
          name: "Another User",
          username, // Same username
          password: "password456",
          phone_number: "0987654321",
          address: "456 Test Ave",
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Username already taken");
      }

      // Clean up
      await db
        .collection("users")
        .deleteOne({ _id: new ObjectId(user.user._id) });
    });

    // Test validation for required fields
    it("should fail to register a user with missing username", async () => {
      try {
        await User.register({
          name: "Test User",
          // Missing username
          password: "password123",
          phone_number: "1234567890",
          address: "123 Test St",
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Username and password are required");
      }
    });

    it("should fail to register a user with missing password", async () => {
      try {
        await User.register({
          name: "Test User",
          username: `testuser_${Date.now()}`,
          // Missing password
          phone_number: "1234567890",
          address: "123 Test St",
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Username and password are required");
      }
    });
  });

  describe("User Login Validation", () => {
    // Test login with non-existent username
    it("should fail to login with non-existent username", async () => {
      try {
        await User.login({
          username: `nonexistent_user_${Date.now()}`,
          password: "password123",
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Invalid username or password");
      }
    });

    // Test login with incorrect password
    it("should fail to login with incorrect password", async () => {
      // First create a user
      const username = `testuser_login_${Date.now()}`;
      const user = await User.register({
        name: "Test User",
        username,
        password: "password123",
        phone_number: "1234567890",
        address: "123 Test St",
      });

      // Now try to login with incorrect password
      try {
        await User.login({
          username,
          password: "wrong_password",
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Invalid username or password");
      }

      // Clean up
      await db
        .collection("users")
        .deleteOne({ _id: new ObjectId(user.user._id) });
    });
  });

  describe("User Update Validation", () => {
    // Test updating a non-existent user
    it("should handle updating a non-existent user", async () => {
      const nonExistentId = new ObjectId().toString();

      try {
        await User.updateUser(nonExistentId, { name: "Updated Name" });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Cannot read properties of null");
      }
    });

    // Test that password cannot be updated via updateUser
    it("should ignore password field in updateUser", async () => {
      // First create a user
      const username = `testuser_update_${Date.now()}`;
      const user = await User.register({
        name: "Test User",
        username,
        password: "password123",
        phone_number: "1234567890",
        address: "123 Test St",
      });

      // Try to update the password via updateUser
      const updatedUser = await User.updateUser(user.user._id, {
        name: "Updated Name",
        password: "new_password", // This should be ignored
      });

      // Verify the password was not updated
      expect(updatedUser.name).toBe("Updated Name");

      // Try to login with the original password
      const loginResult = await User.login({
        username,
        password: "password123", // Original password should still work
      });

      expect(loginResult.user._id.toString()).toBe(user.user._id.toString());

      // Clean up
      await db
        .collection("users")
        .deleteOne({ _id: new ObjectId(user.user._id) });
    });
  });

  describe("Password Update Validation", () => {
    // Test updating password with incorrect current password
    it("should fail to update password with incorrect current password", async () => {
      // First create a user
      const username = `testuser_password_${Date.now()}`;
      const user = await User.register({
        name: "Test User",
        username,
        password: "password123",
        phone_number: "1234567890",
        address: "123 Test St",
      });

      // Try to update password with incorrect current password
      try {
        await User.updatePassword(
          user.user._id,
          "wrong_password",
          "new_password"
        );
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Current password is incorrect");
      }

      // Clean up
      await db
        .collection("users")
        .deleteOne({ _id: new ObjectId(user.user._id) });
    });

    // Test updating password for non-existent user
    it("should fail to update password for non-existent user", async () => {
      const nonExistentId = new ObjectId().toString();

      try {
        await User.updatePassword(
          nonExistentId,
          "current_password",
          "new_password"
        );
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("not found");
      }
    });
  });

  describe("User Deletion Validation", () => {
    // Test deleting a non-existent user
    it("should fail to delete a non-existent user", async () => {
      const nonExistentId = new ObjectId().toString();

      try {
        await User.deleteUser(nonExistentId);
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("not found");
      }
    });
  });

  describe("User Finder Methods", () => {
    // Test findUserByUsername with non-existent username
    it("should return null when finding a non-existent username", async () => {
      const nonExistentUsername = `nonexistent_${Date.now()}`;
      const user = await User.findUserByUsername(nonExistentUsername);
      expect(user).toBeNull();
    });

    // Test findUserById with non-existent ID
    it("should return null when finding a non-existent user ID", async () => {
      const nonExistentId = new ObjectId().toString();
      const user = await User.findUserById(nonExistentId);
      expect(user).toBeNull();
    });
  });
});
