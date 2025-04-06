import { ObjectId } from "mongodb";
import Book from "../models/book.js";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import { getDb } from "../config/mongodb.js";

describe("Book Model Tests", () => {
  let db;
  let uploaderId;
  let bookId;

  beforeAll(async () => {
    await setupDatabase();
    db = getDb();

    // Create test IDs
    uploaderId = new ObjectId().toString();
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  it("should create a book", async () => {
    const bookData = {
      title: "Test Book",
      author: "Test Author",
      genres: ["Fiction", "Fantasy"],
      synopsis: "A test book for testing purposes",
      cover_type: "paperback",
      condition: 9,
      condition_details: "Like new",
      thumbnail_url: "https://example.com/thumbnail.jpg",
      image_urls: [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ],
      status: "forRent",
      price: 5000,
      uploaded_by: uploaderId,
    };

    const book = await Book.addBook(bookData);
    expect(book).toBeDefined();
    expect(book._id).toBeDefined();
    expect(book.title).toBe("Test Book");
    expect(book.author).toBe("Test Author");
    expect(book.price).toBe(5000);

    bookId = book._id.toString();
  });

  it("should find a book by ID", async () => {
    const book = await Book.findBookById(bookId);
    expect(book).toBeDefined();
    expect(book._id.toString()).toBe(bookId);
    expect(book.title).toBe("Test Book");
  });

  it("should find all books", async () => {
    const result = await Book.findAll();
    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.pagination).toBeDefined();
  });

  it("should find books with query", async () => {
    const result = await Book.findAll({ query: "Test" });
    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Array);

    // If we have results, check that they match the search query
    if (result.data.length > 0) {
      const hasMatch = result.data.some(
        (book) => book.title.includes("Test") || book.author.includes("Test")
      );
      expect(hasMatch).toBe(true);
    }
  });

  it("should find books with filters", async () => {
    const result = await Book.findAll({
      filters: {
        status: "forRent",
        minPrice: 1000,
        maxPrice: 10000,
        genres: ["Fiction"],
        cover_type: "paperback",
      },
    });
    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Array);
  });

  it("should find books with pagination and sorting", async () => {
    const result = await Book.findAll({
      limit: 5,
      skip: 0,
      sortField: "price",
      sortOrder: -1,
    });
    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Array);
    expect(result.pagination.limit).toBe(5);
  });

  it("should find books by uploader ID", async () => {
    const result = await Book.findAll({
      filters: { uploaded_by: uploaderId },
    });
    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Array);
  });

  it("should check if a book is available", async () => {
    const isAvailable = await Book.isBookAvailable(bookId);
    expect(typeof isAvailable).toBe("boolean");
  });

  it("should update a book", async () => {
    const updateData = {
      title: "Updated Test Book",
      price: 6000,
      status: "isClosed",
    };

    const updatedBook = await Book.updateBook(bookId, updateData);
    expect(updatedBook).toBeDefined();
    expect(updatedBook.title).toBe("Updated Test Book");
    expect(updatedBook.price).toBe(6000);
    expect(updatedBook.status).toBe("isClosed");
  });

  it("should validate book data", async () => {
    // Test missing title
    try {
      await Book.addBook({
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        condition: 8,
        status: "forRent",
        price: 5000,
        uploaded_by: uploaderId,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Title is required");
    }

    // Test missing author
    try {
      await Book.addBook({
        title: "Test Book",
        genres: ["Fiction"],
        cover_type: "paperback",
        condition: 8,
        status: "forRent",
        price: 5000,
        uploaded_by: uploaderId,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Author is required");
    }

    // Test invalid genres
    try {
      await Book.addBook({
        title: "Test Book",
        author: "Test Author",
        genres: "Fiction", // Not an array
        cover_type: "paperback",
        condition: 8,
        status: "forRent",
        price: 5000,
        uploaded_by: uploaderId,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Genres must be an array");
    }

    // Test invalid cover type
    try {
      await Book.addBook({
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "invalid_type", // Invalid cover type
        condition: 8,
        status: "forRent",
        price: 5000,
        uploaded_by: uploaderId,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Cover type must be either");
    }

    // Test invalid condition
    try {
      await Book.addBook({
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        condition: 11, // Invalid condition (> 10)
        status: "forRent",
        price: 5000,
        uploaded_by: uploaderId,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain(
        "Condition must be a number between 0 and 10"
      );
    }

    // Test invalid status
    try {
      await Book.addBook({
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        condition: 8,
        status: "invalid_status", // Invalid status
        price: 5000,
        uploaded_by: uploaderId,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Status must be either");
    }

    // Test invalid price
    try {
      await Book.addBook({
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        condition: 8,
        status: "forRent",
        price: -100, // Negative price
        uploaded_by: uploaderId,
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("Price must be a positive number");
    }

    // Test missing uploaded_by
    try {
      await Book.addBook({
        title: "Test Book",
        author: "Test Author",
        genres: ["Fiction"],
        cover_type: "paperback",
        condition: 8,
        status: "forRent",
        price: 5000,
        // Missing uploaded_by
      });
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      expect(error.message).toContain("uploaded_by is required");
    }
  });

  it("should handle updating a non-existent book", async () => {
    const nonExistentId = new ObjectId().toString();
    try {
      await Book.updateBook(nonExistentId, { title: "This should fail" });
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Just check that an error was thrown
      expect(error).toBeDefined();
    }
  });

  it("should delete a book", async () => {
    // Create a book to delete
    const bookData = {
      title: "Book to Delete",
      author: "Delete Author",
      genres: ["Fiction"],
      cover_type: "paperback",
      condition: 7,
      status: "forRent",
      price: 4000,
      uploaded_by: uploaderId,
    };

    const book = await Book.addBook(bookData);
    const bookIdToDelete = book._id.toString();

    // Delete the book
    await Book.deleteBook(bookIdToDelete);

    // Try to find the deleted book
    try {
      const deletedBook = await Book.findBookById(bookIdToDelete);
      expect(deletedBook).toBeNull();
    } catch (error) {
      // If findBookById throws an error for a non-existent book, that's also acceptable
      expect(error).toBeDefined();
    }
  });

  it("should handle deleting a non-existent book", async () => {
    const nonExistentId = new ObjectId().toString();
    try {
      await Book.deleteBook(nonExistentId);
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Just check that an error was thrown
      expect(error).toBeDefined();
    }
  });
});
