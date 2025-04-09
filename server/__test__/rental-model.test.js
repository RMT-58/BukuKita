import { ObjectId } from "mongodb";
import RentalDetail from "../models/rentalDetail.js";
import Rental from "../models/rental.js";
import { describe, expect, it, beforeAll, afterAll, jest } from "@jest/globals";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import { getDb } from "../config/mongodb.js";
import crypto from "crypto";

describe("Rental Model Tests", () => {
  let db;
  let bookId;
  let rentalId;
  let rentalDetailId;

  beforeAll(async () => {
    await setupDatabase();
    db = getDb();

    bookId = new ObjectId();
    rentalId = new ObjectId();
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  it("should create a rental detail", async () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

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

    expect(rentalDetail.book_id.toString()).toEqual(bookId.toString());
    expect(rentalDetail.rental_id.toString()).toEqual(rentalId.toString());
    expect(rentalDetail.price).toBe(5000);
    expect(rentalDetail.period).toBe(7);
    expect(rentalDetail.total).toBe(35000);

    rentalDetailId = rentalDetail._id;
  });

  it("should find a rental detail by ID", async () => {
    const rentalDetail = await RentalDetail.findDetailById(
      rentalDetailId.toString()
    );
    expect(rentalDetail).toBeDefined();
    expect(rentalDetail._id.toString()).toEqual(rentalDetailId.toString());
    expect(rentalDetail.book_id.toString()).toEqual(bookId.toString());
    expect(rentalDetail.rental_id.toString()).toEqual(rentalId.toString());
  });

  it("should find all rental details", async () => {
    const rentalDetails = await RentalDetail.findAll();
    expect(rentalDetails).toBeDefined();
    expect(rentalDetails).toBeInstanceOf(Array);
    expect(rentalDetails.length).toBeGreaterThan(0);
  });

  it("should find rental details by rental ID", async () => {
    const rentalDetails = await RentalDetail.findDetailsByRentalId(
      rentalId.toString()
    );
    expect(rentalDetails).toBeDefined();
    expect(rentalDetails).toBeInstanceOf(Array);
    expect(rentalDetails.length).toBeGreaterThan(0);
    expect(rentalDetails[0].rental_id.toString()).toEqual(rentalId.toString());
  });

  it("should find active rentals by book ID", async () => {
    const activeRentals = await RentalDetail.findActiveRentalsByBookId(
      bookId.toString()
    );
    expect(activeRentals).toBeDefined();
    expect(activeRentals).toBeInstanceOf(Array);
  });

  it("should update a rental detail", async () => {
    const updateData = {
      price: 6000,
      period: 10,
    };

    const updatedRentalDetail = await RentalDetail.updateRentalDetail(
      rentalDetailId.toString(),
      updateData
    );
    expect(updatedRentalDetail).toBeDefined();
    expect(updatedRentalDetail.price).toBe(6000);
    expect(updatedRentalDetail.period).toBe(10);
    expect(updatedRentalDetail.total).toBe(60000);
  });

  it("should update rental dates", async () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    const updateData = {
      rental_start: startDate,
      rental_end: endDate,
    };

    const updatedRentalDetail = await RentalDetail.updateRentalDetail(
      rentalDetailId.toString(),
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
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    try {
      await RentalDetail.createRentalDetail({
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
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("Book ID is required");
    }

    try {
      await RentalDetail.createRentalDetail({
        book_id: bookId,
        price: 5000,
        period: 7,
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",

        rental_start: startDate,
        rental_end: endDate,
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("Rental ID is required");
    }

    try {
      await RentalDetail.createRentalDetail({
        book_id: bookId,
        price: -100,
        period: 7,
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: startDate,
        rental_end: endDate,
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("Price must be a positive number");
    }

    try {
      await RentalDetail.createRentalDetail({
        book_id: bookId,
        price: "5000",
        period: 7,
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: startDate,
        rental_end: endDate,
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("Price must be a positive number");
    }

    try {
      await RentalDetail.createRentalDetail({
        book_id: bookId,
        price: 5000,
        period: 0,
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: startDate,
        rental_end: endDate,
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("Period must be a positive number");
    }

    try {
      await RentalDetail.createRentalDetail({
        book_id: bookId,
        price: 5000,
        period: "7",
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        rental_id: rentalId,
        rental_start: startDate,
        rental_end: endDate,
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("Period must be a positive number");
    }

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
        rental_start: endDate,
        rental_end: startDate,
      });
      expect(true).toBe(false);
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

      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should delete a rental detail", async () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

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

    await RentalDetail.deleteRentalDetail(detailIdToDelete);

    const deletedDetail = await RentalDetail.findDetailById(detailIdToDelete);
    expect(deletedDetail).toBeNull();
  });

  it("should handle deleting a non-existent rental detail", async () => {
    const nonExistentId = new ObjectId().toString();
    try {
      await RentalDetail.deleteRentalDetail(nonExistentId);

      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("not found");
    }
  });

  it("should validate rental status values", async () => {
    const mockCollection = {
      findOneAndUpdate: jest.fn().mockResolvedValue({
        value: { status: "completed" },
      }),
    };

    const originalGetCollection = Rental.getCollection;
    Rental.getCollection = jest.fn().mockReturnValue(mockCollection);

    try {
      const validStatusResult = await Rental.updateRentalStatus(
        new ObjectId().toString(),
        "completed"
      );
      expect(validStatusResult).toBeDefined();

      await expect(
        Rental.updateRentalStatus(new ObjectId().toString(), "invalid_status")
      ).rejects.toThrow("Invalid status value");
    } finally {
      Rental.getCollection = originalGetCollection;
    }
  });

  it("should handle null result value in updateRentalStatus", async () => {
    const testId = new ObjectId().toString();

    const mockCollection = {
      findOneAndUpdate: jest.fn().mockResolvedValue({ value: null }),
      findOne: jest.fn().mockResolvedValue({ _id: testId, status: "pending" }),
    };

    const originalGetCollection = Rental.getCollection;
    Rental.getCollection = jest.fn().mockReturnValue(mockCollection);

    try {
      const result = await Rental.updateRentalStatus(testId, "completed");
      expect(result).toBeDefined();
      expect(result._id).toBe(testId);
      expect(mockCollection.findOne).toHaveBeenCalled();
    } finally {
      Rental.getCollection = originalGetCollection;
    }
  });

  it("should handle non-existent rental in updateRentalStatus", async () => {
    const testId = new ObjectId().toString();

    const mockCollection = {
      findOneAndUpdate: jest.fn().mockResolvedValue({ value: null }),
      findOne: jest.fn().mockResolvedValue(null),
    };

    const originalGetCollection = Rental.getCollection;
    Rental.getCollection = jest.fn().mockReturnValue(mockCollection);

    try {
      await expect(
        Rental.updateRentalStatus(testId, "completed")
      ).rejects.toThrow(`Rental with ID ${testId} not found`);
      expect(mockCollection.findOne).toHaveBeenCalled();
    } finally {
      Rental.getCollection = originalGetCollection;
    }
  });

  it("should handle non-existent rental in deleteRental", async () => {
    const testId = new ObjectId().toString();

    const mockCollection = {
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    };

    const originalGetCollection = Rental.getCollection;
    Rental.getCollection = jest.fn().mockReturnValue(mockCollection);

    try {
      await expect(Rental.deleteRental(testId)).rejects.toThrow(
        `Rental with ID ${testId} not found`
      );
      expect(mockCollection.deleteOne).toHaveBeenCalled();
    } finally {
      Rental.getCollection = originalGetCollection;
    }
  });

  it("should handle Midtrans webhook with valid data", async () => {
    const originalFindMethod = Rental.findRentalById;

    Rental.findRentalById = jest.fn().mockResolvedValue({
      _id: new ObjectId(),
      user_id: "test-user-id",
      total_amount: 12000,
      status: "pending",
      payment_method: "credit_card",
    });

    const originalUpdateMethod = Rental.updateRentalStatus;
    Rental.updateRentalStatus = jest.fn().mockResolvedValue({
      _id: new ObjectId(),
      status: "completed",
      payment_method: "credit_card",
    });

    process.env.MIDTRANS_SERVER_KEY = "test-server-key";

    const webhookData = {
      order_id: new ObjectId().toString(),
      status_code: "200",
      gross_amount: "12000",
      transaction_status: "settlement",
      payment_type: "credit_card",
      signature_key: "mocked-signature-key",
    };

    const originalCreateHash = crypto.createHash;
    crypto.createHash = jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue("mocked-signature-key"),
    });

    try {
      const result = await Rental.handleMidtransWebhook(webhookData);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Rental.updateRentalStatus).toHaveBeenCalled();
    } finally {
      Rental.findRentalById = originalFindMethod;
      Rental.updateRentalStatus = originalUpdateMethod;
      crypto.createHash = originalCreateHash;
    }
  });

  it("should handle Midtrans webhook with non-existent order", async () => {
    const originalFindMethod = Rental.findRentalById;
    Rental.findRentalById = jest.fn().mockResolvedValue(null);

    const webhookData = {
      order_id: "non-existent-id",
      status_code: "200",
      gross_amount: "12000",
      transaction_status: "settlement",
      payment_type: "credit_card",
    };

    try {
      const result = await Rental.handleMidtransWebhook(webhookData);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toContain("not found");
    } finally {
      Rental.findRentalById = originalFindMethod;
    }
  });

  it("should handle Midtrans webhook with already completed rental", async () => {
    const originalFindMethod = Rental.findRentalById;

    Rental.findRentalById = jest.fn().mockResolvedValue({
      _id: new ObjectId(),
      user_id: "test-user-id",
      total_amount: 12000,
      status: "completed",
      payment_method: "credit_card",
    });

    const webhookData = {
      order_id: new ObjectId().toString(),
      status_code: "200",
      gross_amount: "12000",
      transaction_status: "settlement",
      payment_type: "credit_card",
    };

    try {
      const result = await Rental.handleMidtransWebhook(webhookData);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toContain("already processed");
    } finally {
      Rental.findRentalById = originalFindMethod;
    }
  });

  it("should handle Midtrans webhook with invalid rental status", async () => {
    const originalFindMethod = Rental.findRentalById;

    Rental.findRentalById = jest.fn().mockResolvedValue({
      _id: new ObjectId(),
      user_id: "test-user-id",
      total_amount: 12000,
      status: "failed",
      payment_method: "credit_card",
    });

    const webhookData = {
      order_id: new ObjectId().toString(),
      status_code: "200",
      gross_amount: "12000",
      transaction_status: "settlement",
      payment_type: "credit_card",
    };

    try {
      const result = await Rental.handleMidtransWebhook(webhookData);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toContain("Invalid rental status");
    } finally {
      Rental.findRentalById = originalFindMethod;
    }
  });

  it("should handle Midtrans webhook with amount mismatch", async () => {
    const originalFindMethod = Rental.findRentalById;

    Rental.findRentalById = jest.fn().mockResolvedValue({
      _id: new ObjectId(),
      user_id: "test-user-id",
      total_amount: 12000,
      status: "pending",
      payment_method: "credit_card",
    });

    const webhookData = {
      order_id: new ObjectId().toString(),
      status_code: "200",
      gross_amount: "10000",
      transaction_status: "settlement",
      payment_type: "credit_card",
    };

    try {
      const result = await Rental.handleMidtransWebhook(webhookData);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toContain("Amount mismatch");
    } finally {
      Rental.findRentalById = originalFindMethod;
    }
  });

  it("should handle Midtrans webhook with invalid transaction status", async () => {
    const originalFindMethod = Rental.findRentalById;

    Rental.findRentalById = jest.fn().mockResolvedValue({
      _id: new ObjectId(),
      user_id: "test-user-id",
      total_amount: 12000,
      status: "pending",
      payment_method: "credit_card",
    });

    const originalUpdateMethod = Rental.updateRentalStatus;
    Rental.updateRentalStatus = jest.fn().mockResolvedValue({
      _id: new ObjectId(),
      status: "failed",
      payment_method: "credit_card",
    });

    const webhookData = {
      order_id: new ObjectId().toString(),
      status_code: "200",
      gross_amount: "12000",
      transaction_status: "invalid_status",
      payment_type: "credit_card",
    };

    try {
      const result = await Rental.handleMidtransWebhook(webhookData);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toContain("Invalid transaction status");
      expect(Rental.updateRentalStatus).toHaveBeenCalled();
    } finally {
      Rental.findRentalById = originalFindMethod;
      Rental.updateRentalStatus = originalUpdateMethod;
    }
  });

  it("should handle Midtrans webhook with invalid signature", async () => {
    const originalFindMethod = Rental.findRentalById;

    Rental.findRentalById = jest.fn().mockResolvedValue({
      _id: new ObjectId(),
      user_id: "test-user-id",
      total_amount: 12000,
      status: "pending",
      payment_method: "credit_card",
    });

    process.env.MIDTRANS_SERVER_KEY = "test-server-key";

    const webhookData = {
      order_id: new ObjectId().toString(),
      status_code: "200",
      gross_amount: "12000",
      transaction_status: "settlement",
      payment_type: "credit_card",
      signature_key: "invalid-signature-key",
    };

    const originalCreateHash = crypto.createHash;
    crypto.createHash = jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue("correct-signature-key"),
    });

    try {
      const result = await Rental.handleMidtransWebhook(webhookData);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toContain("Invalid signature");
    } finally {
      Rental.findRentalById = originalFindMethod;
      crypto.createHash = originalCreateHash;
    }
  });

  it("should handle error during Midtrans webhook processing", async () => {
    const originalFindMethod = Rental.findRentalById;
    Rental.findRentalById = jest.fn().mockImplementation(() => {
      throw new Error("Test error");
    });

    const webhookData = {
      order_id: new ObjectId().toString(),
      status_code: "200",
      gross_amount: "12000",
      transaction_status: "settlement",
      payment_type: "credit_card",
    };

    try {
      const result = await Rental.handleMidtransWebhook(webhookData);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toContain("Test error");
    } finally {
      Rental.findRentalById = originalFindMethod;
    }
  });

  it("should refresh payment token", async () => {
    const originalMethod = Rental.refreshPaymentToken;

    const mockRental = {
      _id: new ObjectId(),
      token: "new-token",
      redirect_url: "https://example.com/new-url",
      status: "pending",
    };

    try {
      Rental.refreshPaymentToken = jest.fn().mockResolvedValue(mockRental);

      const result = await Rental.refreshPaymentToken("some-id");

      expect(result).toEqual(mockRental);
      expect(Rental.refreshPaymentToken).toHaveBeenCalledWith("some-id");
    } finally {
      Rental.refreshPaymentToken = originalMethod;
    }
  });

  it("should handle error during payment token refresh", async () => {
    const originalMethod = Rental.refreshPaymentToken;

    const paymentError = new Error(
      "Failed to refresh payment token: Midtrans API error"
    );

    try {
      Rental.refreshPaymentToken = jest.fn().mockImplementation(() => {
        throw paymentError;
      });

      try {
        await Rental.refreshPaymentToken("some-id");

        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("Failed to refresh payment token");
        expect(error.message).toContain("Midtrans API error");
      }
    } finally {
      Rental.refreshPaymentToken = originalMethod;
    }
  });

  it("should handle non-existent rental during token refresh", async () => {
    const originalFindMethod = Rental.findRentalById;
    Rental.findRentalById = jest.fn().mockResolvedValue(null);

    try {
      await Rental.refreshPaymentToken(new ObjectId().toString());

      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("not found");
    } finally {
      Rental.findRentalById = originalFindMethod;
    }
  });
});
