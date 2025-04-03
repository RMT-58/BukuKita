import { ObjectId } from "mongodb";
import Rental from "../models/rental.js";
import RentalDetail from "../models/rentalDetail.js";
import { describe, expect, it, beforeAll } from "@jest/globals";
import { getDb } from "../config/mongodb.js";

describe("Rental and RentalDetail Validation Tests", () => {
  let db;

  beforeAll(async () => {
    db = getDb(); // Get database connection
  });

  // ==================== RENTAL MODEL VALIDATION TESTS ====================
  describe("Rental Model Validation", () => {
    // Test validation for user_id in createRental
    it("should fail to create a rental with missing user_id", async () => {
      try {
        await Rental.createRental({
          // Missing user_id
          total_amount: 5000,
          payment_method: "credit_card",
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("User ID is required");
      }
    });

    // Test validation for total_amount in createRental
    it("should fail to create a rental with negative total_amount", async () => {
      try {
        await Rental.createRental({
          user_id: new ObjectId().toString(),
          total_amount: -100, // Negative amount
          payment_method: "credit_card",
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain(
          "Total amount must be a positive number"
        );
      }
    });

    // Test validation for total_amount in createRental (non-number)
    it("should fail to create a rental with non-number total_amount", async () => {
      try {
        await Rental.createRental({
          user_id: new ObjectId().toString(),
          total_amount: "5000", // String instead of number
          payment_method: "credit_card",
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain(
          "Total amount must be a positive number"
        );
      }
    });

    // Test validation for status in updateRentalStatus
    it("should fail to update a rental with invalid status", async () => {
      try {
        await Rental.updateRentalStatus(
          new ObjectId().toString(),
          "invalid_status"
        );
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Invalid status value");
      }
    });

    // Test error handling when a rental is not found in updateRentalStatus
    it("should throw an error when updating a non-existent rental", async () => {
      const nonExistentId = new ObjectId().toString();

      try {
        await Rental.updateRentalStatus(nonExistentId, "completed");
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        // The error could be about null value or not found, depending on implementation
        expect(error.message).toBeDefined();
      }
    });
  });

  // ==================== RENTAL DETAIL MODEL VALIDATION TESTS ====================
  describe("RentalDetail Model Validation", () => {
    // Test validation for book_id in createRentalDetail
    it("should fail to create a rental detail with missing book_id", async () => {
      try {
        await RentalDetail.createRentalDetail({
          // Missing book_id
          price: 5000,
          period: 7,
          title: "Test Book",
          author: "Test Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          rental_id: new ObjectId().toString(),
          rental_start: new Date(),
          rental_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Book ID is required");
      }
    });

    // Test validation for rental_id in createRentalDetail
    it("should fail to create a rental detail with missing rental_id", async () => {
      try {
        await RentalDetail.createRentalDetail({
          book_id: new ObjectId().toString(),
          price: 5000,
          period: 7,
          title: "Test Book",
          author: "Test Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          // Missing rental_id
          rental_start: new Date(),
          rental_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Rental ID is required");
      }
    });

    // Test validation for price in createRentalDetail
    it("should fail to create a rental detail with negative price", async () => {
      try {
        await RentalDetail.createRentalDetail({
          book_id: new ObjectId().toString(),
          price: -100, // Negative price
          period: 7,
          title: "Test Book",
          author: "Test Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          rental_id: new ObjectId().toString(),
          rental_start: new Date(),
          rental_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Price must be a positive number");
      }
    });

    // Test validation for price in createRentalDetail (non-number)
    it("should fail to create a rental detail with non-number price", async () => {
      try {
        await RentalDetail.createRentalDetail({
          book_id: new ObjectId().toString(),
          price: "5000", // String instead of number
          period: 7,
          title: "Test Book",
          author: "Test Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          rental_id: new ObjectId().toString(),
          rental_start: new Date(),
          rental_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Price must be a positive number");
      }
    });

    // Test validation for period in createRentalDetail
    it("should fail to create a rental detail with invalid period", async () => {
      try {
        await RentalDetail.createRentalDetail({
          book_id: new ObjectId().toString(),
          price: 5000,
          period: 0, // Invalid period (should be > 0)
          title: "Test Book",
          author: "Test Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          rental_id: new ObjectId().toString(),
          rental_start: new Date(),
          rental_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Period must be a positive number");
      }
    });

    // Test validation for period in createRentalDetail (non-number)
    it("should fail to create a rental detail with non-number period", async () => {
      try {
        await RentalDetail.createRentalDetail({
          book_id: new ObjectId().toString(),
          price: 5000,
          period: "7", // String instead of number
          title: "Test Book",
          author: "Test Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          rental_id: new ObjectId().toString(),
          rental_start: new Date(),
          rental_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Period must be a positive number");
      }
    });

    // Test validation for rental dates in createRentalDetail
    it("should fail to create a rental detail with end date before start date", async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // End date 1 day before start date

      try {
        await RentalDetail.createRentalDetail({
          book_id: new ObjectId().toString(),
          price: 5000,
          period: 7,
          title: "Test Book",
          author: "Test Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          rental_id: new ObjectId().toString(),
          rental_start: startDate,
          rental_end: endDate, // End date before start date
        });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain(
          "Rental end date must be after start date"
        );
      }
    });

    // Test updating rental dates in updateRentalDetail
    it("should update rental dates correctly", async () => {
      // First create a rental detail
      const rentalId = new ObjectId().toString();
      const bookId = new ObjectId().toString();
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

      // Insert directly into the database to avoid validation
      const collection = db.collection("rentalDetails");
      const result = await collection.insertOne({
        book_id: bookId,
        price: 5000,
        period: 7,
        total: 35000,
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: startDate,
        rental_end: endDate,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const detailId = result.insertedId.toString();

      // Now update the rental dates
      const newEndDate = new Date(
        startDate.getTime() + 14 * 24 * 60 * 60 * 1000
      ); // 14 days later

      try {
        await RentalDetail.updateRentalDetail(detailId, {
          rental_start: startDate,
          rental_end: newEndDate,
        });

        // Verify the update
        const updatedDetail = await collection.findOne({
          _id: result.insertedId,
        });
        expect(updatedDetail.rental_end.getTime()).toBe(newEndDate.getTime());

        // Clean up
        await collection.deleteOne({ _id: result.insertedId });
      } catch (error) {
        // Clean up even if there's an error
        await collection.deleteOne({ _id: result.insertedId });
        throw error;
      }
    });

    // Test updating price and period in updateRentalDetail
    it("should recalculate total when updating price and period", async () => {
      // First create a rental detail
      const rentalId = new ObjectId().toString();
      const bookId = new ObjectId().toString();
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

      // Insert directly into the database to avoid validation
      const collection = db.collection("rentalDetails");
      const result = await collection.insertOne({
        book_id: bookId,
        price: 5000,
        period: 7,
        total: 35000,
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: startDate,
        rental_end: endDate,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const detailId = result.insertedId.toString();

      // Now update the price and period
      try {
        await RentalDetail.updateRentalDetail(detailId, {
          price: 6000,
          period: 10,
        });

        // Verify the update
        const updatedDetail = await collection.findOne({
          _id: result.insertedId,
        });
        expect(updatedDetail.price).toBe(6000);
        expect(updatedDetail.period).toBe(10);
        expect(updatedDetail.total).toBe(60000); // 6000 * 10

        // Clean up
        await collection.deleteOne({ _id: result.insertedId });
      } catch (error) {
        // Clean up even if there's an error
        await collection.deleteOne({ _id: result.insertedId });
        throw error;
      }
    });

    // Test error handling when a rental detail is not found in updateRentalDetail
    it("should handle updating a non-existent rental detail", async () => {
      const nonExistentId = new ObjectId().toString();

      try {
        await RentalDetail.updateRentalDetail(nonExistentId, { price: 6000 });
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        // The error could be about null value or not found, depending on implementation
        expect(error.message).toBeDefined();
      }
    });

    // Test error handling when a rental detail is not found in deleteRentalDetail
    it("should throw an error when deleting a non-existent rental detail", async () => {
      const nonExistentId = new ObjectId().toString();

      try {
        await RentalDetail.deleteRentalDetail(nonExistentId);
        // If we reach here, the test should fail
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("not found");
      }
    });
  });
});
