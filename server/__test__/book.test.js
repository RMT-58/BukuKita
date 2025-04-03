import { createApolloServer } from "../index.js"
import request from "supertest"
import dotenv from "dotenv"
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals"

// Load environment variables
dotenv.config()

describe("Book API Tests", () => {
  let server, url
  let token // To store the token after registration/login
  let userId // To store the user ID after registration
  let bookId // To store the book ID after creation
  let testUsername // To store the username for login test

  // Before all tests, create a new Apollo Server instance
  beforeAll(async () => {
    ;({ server, url } = await createApolloServer({ port: 0 }))
    url = new URL(url).origin // Extract just the origin part of the URL

    // Register a test user to get a token for authenticated requests
    testUsername = `testuser_${Date.now()}`

    const registerMutation = {
      query: `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            token
            user {
              _id
              name
              username
            }
          }
        }
      `,
      variables: {
        input: {
          name: "Test User",
          username: testUsername,
          password: "password123",
          phone_number: "1234567890",
          address: "123 Test St",
        },
      },
    }

    const response = await request(url).post("/").send(registerMutation)
    token = response.body.data.register.token
    userId = response.body.data.register.user._id
  })

  // After all tests, stop the server
  afterAll(async () => {
    // Clean up - delete the test book if it exists
    if (bookId) {
      const deleteBookMutation = {
        query: `
          mutation DeleteBook($id: ID!) {
            deleteBook(id: $id)
          }
        `,
        variables: {
          id: bookId,
        },
      }

      await request(url).post("/").set("Authorization", `Bearer ${token}`).send(deleteBookMutation)
    }

    // Delete the test user
    if (userId) {
      const deleteUserMutation = {
        query: `
          mutation DeleteUser($id: ID!) {
            deleteUser(id: $id)
          }
        `,
        variables: {
          id: userId,
        },
      }

      await request(url).post("/").set("Authorization", `Bearer ${token}`).send(deleteUserMutation)
    }

    await server?.stop()
  })

  // Test adding a book (requires authentication)
  it("should add a new book when authenticated", async () => {
    const addBookMutation = {
      query: `
        mutation AddBook($input: AddBookInput!) {
          addBook(input: $input) {
            _id
            title
            author
            genres
            synopsis
            cover_type
            condition
            condition_details
            thumbnail_url
            image_urls
            status
            price
            uploaded_by
            created_at
            updated_at
          }
        }
      `,
      variables: {
        input: {
          title: "Test Book",
          author: "Test Author",
          genres: ["Fiction", "Test"],
          synopsis: "This is a test book",
          cover_type: "paperback",
          condition: 8,
          condition_details: "Like new",
          thumbnail_url: "https://example.com/thumbnail.jpg",
          image_urls: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
          status: "forRent",
          price: 5000,
        },
      },
    }

    const response = await request(url).post("/").set("Authorization", `Bearer ${token}`).send(addBookMutation)

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.addBook).toBeDefined()
    expect(response.body.data.addBook.title).toBe("Test Book")
    expect(response.body.data.addBook.author).toBe("Test Author")
    expect(response.body.data.addBook.genres).toEqual(["Fiction", "Test"])
    expect(response.body.data.addBook.cover_type).toBe("paperback")
    expect(response.body.data.addBook.condition).toBe(8)
    expect(response.body.data.addBook.status).toBe("forRent")
    expect(response.body.data.addBook.price).toBe(5000)
    expect(response.body.data.addBook.uploaded_by).toBe(userId)

    // Save book ID for later tests
    bookId = response.body.data.addBook._id
  })

  // Test finding all books (public endpoint)
  it("should find all books without authentication", async () => {
    const findAllQuery = {
      query: `
        query {
          findAll {
            _id
            title
            author
            genres
            status
            price
          }
        }
      `,
    }

    const response = await request(url).post("/").send(findAllQuery)

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.findAll).toBeDefined()
    expect(Array.isArray(response.body.data.findAll)).toBe(true)

    // Check if our test book is in the results
    if (bookId) {
      const testBook = response.body.data.findAll.find((book) => book._id === bookId)
      expect(testBook).toBeDefined()
      expect(testBook.title).toBe("Test Book")
    }
  })

  // Test finding a book by ID (public endpoint)
  it("should find a book by ID without authentication", async () => {
    // Skip this test if we don't have a book ID
    if (!bookId) {
      console.log("Skipping findBookById test because no book was created")
      return
    }

    const findBookByIdQuery = {
      query: `
        query FindBookById($id: ID!) {
          findBookById(id: $id) {
            _id
            title
            author
            genres
            synopsis
            cover_type
            condition
            condition_details
            thumbnail_url
            image_urls
            status
            price
            uploaded_by
          }
        }
      `,
      variables: {
        id: bookId,
      },
    }

    const response = await request(url).post("/").send(findBookByIdQuery)

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.findBookById).toBeDefined()
    expect(response.body.data.findBookById._id).toBe(bookId)
    expect(response.body.data.findBookById.title).toBe("Test Book")
    expect(response.body.data.findBookById.author).toBe("Test Author")
  })

  // Test searching books (public endpoint)
  it("should search books by query without authentication", async () => {
    const searchBooksQuery = {
      query: `
        query SearchBooks($query: String!, $options: BookOptions) {
          searchBooks(query: $query, options: $options) {
            _id
            title
            author
            genres
          }
        }
      `,
      variables: {
        query: "Test",
        options: {
          limit: 10,
          skip: 0,
        },
      },
    }

    const response = await request(url).post("/").send(searchBooksQuery)

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.searchBooks).toBeDefined()
    expect(Array.isArray(response.body.data.searchBooks)).toBe(true)

    // Our test book should be in the results
    if (bookId) {
      const testBook = response.body.data.searchBooks.find((book) => book._id === bookId)
      expect(testBook).toBeDefined()
    }
  })

  // Test filtering books (public endpoint)
  it("should filter books without authentication", async () => {
    const filterBooksQuery = {
      query: `
        query FilterBooks($filters: BookFilters!, $options: BookOptions) {
          filterBooks(filters: $filters, options: $options) {
            _id
            title
            author
            genres
            status
            price
          }
        }
      `,
      variables: {
        filters: {
          status: "forRent",
          genres: ["Fiction"],
        },
        options: {
          limit: 10,
          skip: 0,
        },
      },
    }

    const response = await request(url).post("/").send(filterBooksQuery)

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.filterBooks).toBeDefined()
    expect(Array.isArray(response.body.data.filterBooks)).toBe(true)

    // All returned books should have status "forRent"
    response.body.data.filterBooks.forEach((book) => {
      expect(book.status).toBe("forRent")
    })
  })

  // Test checking if a book is available (public endpoint)
  it("should check if a book is available without authentication", async () => {
    // Skip this test if we don't have a book ID
    if (!bookId) {
      console.log("Skipping isBookAvailable test because no book was created")
      return
    }

    const isBookAvailableQuery = {
      query: `
        query IsBookAvailable($id: ID!) {
          isBookAvailable(id: $id)
        }
      `,
      variables: {
        id: bookId,
      },
    }

    const response = await request(url).post("/").send(isBookAvailableQuery)

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.isBookAvailable).toBeDefined()
    // The book should be available since we just created it and haven't rented it
    expect(typeof response.body.data.isBookAvailable).toBe("boolean")
  })

  // Test getting my books (requires authentication)
  it("should get my books when authenticated", async () => {
    const myBooksQuery = {
      query: `
        query {
          myBooks {
            _id
            title
            author
            uploaded_by
          }
        }
      `,
    }

    const response = await request(url).post("/").set("Authorization", `Bearer ${token}`).send(myBooksQuery)

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.myBooks).toBeDefined()
    expect(Array.isArray(response.body.data.myBooks)).toBe(true)

    // Our test book should be in the results
    if (bookId) {
      const testBook = response.body.data.myBooks.find((book) => book._id === bookId)
      expect(testBook).toBeDefined()
      expect(testBook.uploaded_by).toBe(userId)
    }
  })

  // Test updating a book (requires authentication and authorization)
  it("should update a book when authenticated and authorized", async () => {
    // Skip this test if we don't have a book ID
    if (!bookId) {
      console.log("Skipping updateBook test because no book was created")
      return
    }

    const updateBookMutation = {
      query: `
        mutation UpdateBook($id: ID!, $input: UpdateBookInput!) {
          updateBook(id: $id, input: $input) {
            _id
            title
            author
            synopsis
            price
            updated_at
          }
        }
      `,
      variables: {
        id: bookId,
        input: {
          title: "Updated Test Book",
          synopsis: "This is an updated test book",
          price: 6000,
        },
      },
    }

    const response = await request(url).post("/").set("Authorization", `Bearer ${token}`).send(updateBookMutation)

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.updateBook).toBeDefined()
    expect(response.body.data.updateBook._id).toBe(bookId)
    expect(response.body.data.updateBook.title).toBe("Updated Test Book")
    expect(response.body.data.updateBook.synopsis).toBe("This is an updated test book")
    expect(response.body.data.updateBook.price).toBe(6000)
  })

  // Test deleting a book (requires authentication and authorization)
  it("should delete a book when authenticated and authorized", async () => {
    // Skip this test if we don't have a book ID
    if (!bookId) {
      console.log("Skipping deleteBook test because no book was created")
      return
    }

    const deleteBookMutation = {
      query: `
        mutation DeleteBook($id: ID!) {
          deleteBook(id: $id)
        }
      `,
      variables: {
        id: bookId,
      },
    }

    const response = await request(url).post("/").set("Authorization", `Bearer ${token}`).send(deleteBookMutation)

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.deleteBook).toBeDefined()
    expect(response.body.data.deleteBook).toContain(bookId)

    // Verify the book is deleted by trying to fetch it
    const findBookByIdQuery = {
      query: `
        query FindBookById($id: ID!) {
          findBookById(id: $id) {
            _id
            title
          }
        }
      `,
      variables: {
        id: bookId,
      },
    }

    const verifyResponse = await request(url).post("/").send(findBookByIdQuery)

    // The book should not be found
    expect(verifyResponse.body.errors).toBeDefined()
    expect(verifyResponse.body.errors[0].message).toContain("not found")

    // Set bookId to null since we've deleted it
    bookId = null
  })

  // Test adding a book without authentication (should fail)
  it("should fail to add a book without authentication", async () => {
    const addBookMutation = {
      query: `
        mutation AddBook($input: AddBookInput!) {
          addBook(input: $input) {
            _id
            title
          }
        }
      `,
      variables: {
        input: {
          title: "Unauthorized Book",
          author: "Unauthorized Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          condition: 8,
          status: "forRent",
          price: 5000,
        },
      },
    }

    const response = await request(url).post("/").send(addBookMutation)

    // Check if the response contains an authentication error
    expect(response.body.errors).toBeDefined()
    expect(response.body.errors[0].message).toContain("Authentication required")
  })
})

