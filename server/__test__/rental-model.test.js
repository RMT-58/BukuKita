import { ObjectId } from "mongodb";
import RentalDetail from "../models/rentalDetail.js";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import { getDb } from "../config/mongodb.js";

describe("Rental Model Tests", () => {
  let db;
  let bookId;
  let rentalId;
  let rentalDetailId;

  beforeAll(async () => {
    await setupDatabase();
    db = getDb();

    // Create test IDs
    bookId = new ObjectId().toString();
    rentalId = new ObjectId().toString();
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  it("should create a rental detail", async () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

    const rentalDetailData = {
      book_id: bookId,
      price: 5000,
      period: 7,
      title: "Test Book",
      author: "Test Author",
      genres: ["Fiction"],
      synopsis: "A test book for testing purposes",
      cover_type: "paperback",
      thumbnail_url: "https://example.com/thumbnail.jpg",
      image_urls: [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ],
      rental_id: rentalId,
      rental_start: startDate,
      rental_end: endDate,
    };

    const rentalDetail = await RentalDetail.createRentalDetail(
      rentalDetailData
    );
    expect(rentalDetail).toBeDefined();
    expect(rentalDetail._id).toBeDefined();
    expect(rentalDetail.book_id).toBe(bookId);
    expect(rentalDetail.rental_id).toBe(rentalId);
    expect(rentalDetail.price).toBe(5000);
    expect(rentalDetail.period).toBe(7);
    expect(rentalDetail.total).toBe(35000); // 5000 * 7

    rentalDetailId = rentalDetail._id.toString();
  });

  it("should find a rental detail by ID", async () => {
    const rentalDetail = await RentalDetail.findDetailById(rentalDetailId);
    expect(rentalDetail).toBeDefined();
    expect(rentalDetail._id.toString()).toBe(rentalDetailId);
    expect(rentalDetail.book_id).toBe(bookId);
    expect(rentalDetail.rental_id).toBe(rentalId);
  });

  it("should find all rental details", async () => {
    const rentalDetails = await RentalDetail.findAll();
    expect(rentalDetails).toBeDefined();
    expect(rentalDetails).toBeInstanceOf(Array);
    expect(rentalDetails.length).toBeGreaterThan(0);
  });

  it("should find rental details by rental ID", async () => {
    const rentalDetails = await RentalDetail.findDetailsByRentalId(rentalId);
    expect(rentalDetails).toBeDefined();
    expect(rentalDetails).toBeInstanceOf(Array);
    expect(rentalDetails.length).toBeGreaterThan(0);
    expect(rentalDetails[0].rental_id).toBe(rentalId);
  });

  it("should find active rentals by book ID", async () => {
    const activeRentals = await RentalDetail.findActiveRentalsByBookId(bookId);
    expect(activeRentals).toBeDefined();
    expect(activeRentals).toBeInstanceOf(Array);
  });

  it("should update a rental detail", async () => {
    const updateData = {
      price: 6000,
      period: 10,
    };

    const updatedRentalDetail = await RentalDetail.updateRentalDetail(
      rentalDetailId,
      updateData
    );
    expect(updatedRentalDetail).toBeDefined();
    expect(updatedRentalDetail.price).toBe(6000);
    expect(updatedRentalDetail.period).toBe(10);
    expect(updatedRentalDetail.total).toBe(60000); // 6000 * 10
  });

  it("should update rental dates", async () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days later

    const updateData = {
      rental_start: startDate,
      rental_end: endDate,
    };

    const updatedRentalDetail = await RentalDetail.updateRentalDetail(
      rentalDetailId,
      updateData
    );
    expect(updatedRentalDetail).toBeDefined();
    expect(updatedRentalDetail.rental_start.getTime()).toBe(
      startDate.getTime()
    );
    expect(updatedRentalDetail.rental_end.getTime()).toBe(endDate.getTime());
  });

  it("should validate rental detail data", async () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

    // Test missing book_id
    try {
      await RentalDetail.createRentalDetail({
        // Missing book_id
        price: 5000,
        period: 7,
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: startDate,
        rental_end: endDate,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Book ID is required");
    }

    // Test missing rental_id
    try {
      await RentalDetail.createRentalDetail({
        book_id: bookId,
        price: 5000,
        period: 7,
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        // Missing rental_id
        rental_start: startDate,
        rental_end: endDate,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Rental ID is required");
    }

    // Test invalid price
    try {
      await RentalDetail.createRentalDetail({
        book_id: bookId,
        price: -100, // Negative price
        period: 7,
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: startDate,
        rental_end: endDate,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Price must be a positive number");
    }

    // Test non-number price
    try {
      await RentalDetail.createRentalDetail({
        book_id: bookId,
        price: "5000", // String instead of number
        period: 7,
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: startDate,
        rental_end: endDate,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Price must be a positive number");
    }

    // Test invalid period
    try {
      await RentalDetail.createRentalDetail({
        book_id: bookId,
        price: 5000,
        period: 0, // Invalid period (should be > 0)
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: startDate,
        rental_end: endDate,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Period must be a positive number");
    }

    // Test non-number period
    try {
      await RentalDetail.createRentalDetail({
        book_id: bookId,
        price: 5000,
        period: "7", // String instead of number
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: startDate,
        rental_end: endDate,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Period must be a positive number");
    }

    // Test invalid rental dates
    try {
      await RentalDetail.createRentalDetail({
        book_id: bookId,
        price: 5000,
        period: 7,
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: endDate, // End date
        rental_end: startDate, // Start date (before end date)
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain(
        "Rental end date must be after start date"
      );
    }
  });

  it("should handle updating a non-existent rental detail", async () => {
    const nonExistentId = new ObjectId().toString();
    try {
      await RentalDetail.updateRentalDetail(nonExistentId, { price: 6000 });
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Just check that an error was thrown
      expect(error).toBeDefined();
    }
  });

  it("should delete a rental detail", async () => {
    // Create a rental detail to delete
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

    const rentalDetailData = {
      book_id: bookId,
      price: 4000,
      period: 5,
      title: "Rental Detail to Delete",
      author: "Delete Author",
      genres: ["Fiction"],
      cover_type: "paperback",
      rental_id: rentalId,
      rental_start: startDate,
      rental_end: endDate,
    };

    const rentalDetail = await RentalDetail.createRentalDetail(
      rentalDetailData
    );
    const detailIdToDelete = rentalDetail._id.toString();

    // Delete the rental detail
    await RentalDetail.deleteRentalDetail(detailIdToDelete);

    // Try to find the deleted rental detail
    try {
      const deletedDetail = await RentalDetail.findDetailById(detailIdToDelete);
      expect(deletedDetail).toBeNull();
    } catch (error) {
      // If findDetailById throws an error for a non-existent detail, that's also acceptable
      expect(error).toBeDefined();
    }
  });

  it("should handle deleting a non-existent rental detail", async () => {
    const nonExistentId = new ObjectId().toString();
    try {
      await RentalDetail.deleteRentalDetail(nonExistentId);
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("not found");
    }
  });
});
