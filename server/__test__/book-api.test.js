import request from "supertest";
import { startTestServer, stopTestServer } from "../test-utils.js";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";

describe("Book API Tests", () => {
  let url;
  let token, secondToken;
  let userId, secondUserId;
  let bookIds = [];
  let testUsername, secondTestUsername;

  beforeAll(async () => {
    await setupDatabase();
    const { url: serverUrl } = await startTestServer();
    url = serverUrl;

    testUsername = `bookuser_${Date.now()}`;
    const registerMutation = {
      query: `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            token
            user {
              _id
            }
          }
        }
      `,
      variables: {
        input: {
          name: "Book API Test User",
          username: testUsername,
          password: "password123",
        },
      },
    };

    const response = await request(url).post("/graphql").send(registerMutation);
    token = response.body.data.register.token;
    userId = response.body.data.register.user._id;

    secondTestUsername = `bookuser2_${Date.now()}`;
    const secondRegisterMutation = {
      query: `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            token
            user {
              _id
            }
          }
        }
      `,
      variables: {
        input: {
          name: "Book API Test User 2",
          username: secondTestUsername,
          password: "password123",
        },
      },
    };

    const secondResponse = await request(url)
      .post("/graphql")
      .send(secondRegisterMutation);
    secondToken = secondResponse.body.data.register.token;
    secondUserId = secondResponse.body.data.register.user._id;

    const books = [
      {
        title: "Fantasy Book",
        author: "Fantasy Author",
        genres: ["Fantasy", "Adventure"],
        cover_type: "hardcover",
        condition: 9,
        price: 6000,
        status: "forRent",
      },
      {
        title: "Science Fiction Book",
        author: "Sci-Fi Author",
        genres: ["Science Fiction", "Thriller"],
        cover_type: "paperback",
        condition: 7,
        price: 4500,
        status: "forRent",
      },
      {
        title: "Mystery Novel",
        author: "Mystery Author",
        genres: ["Mystery", "Crime"],
        cover_type: "paperback",
        condition: 8,
        price: 5000,
        status: "isClosed",
      },
    ];

    for (const book of books) {
      const addBookMutation = {
        query: `
          mutation AddBook($input: AddBookInput!) {
            addBook(input: $input) {
              _id
            }
          }
        `,
        variables: {
          input: book,
        },
      };

      const bookResponse = await request(url)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send(addBookMutation);

      bookIds.push(bookResponse.body.data.addBook._id);
    }
  });

  afterAll(async () => {
    await stopTestServer();
    await teardownDatabase();
  });

  it("should add a new book when authenticated", async () => {
    const addBookMutation = {
      query: `
        mutation AddBook($input: AddBookInput!) {
          addBook(input: $input) {
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
        input: {
          title: "Test Book",
          author: "Test Author",
          genres: ["Fiction", "Fantasy"],
          synopsis: "A test book for testing purposes",
          cover_type: "paperback",
          condition: 9,
          condition_details: "Like new",
          status: "forRent",
          price: 5000,
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(addBookMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.addBook).toBeDefined();
    expect(response.body.data.addBook.title).toBe("Test Book");
    expect(response.body.data.addBook.author).toBe("Test Author");
    expect(response.body.data.addBook.price).toBe(5000);

    bookIds.push(response.body.data.addBook._id);
  });

  it("should find a book by ID", async () => {
    const findBookByIdQuery = {
      query: `
        query FindBookById($id: ID!) {
          findBookById(id: $id) {
            _id
            title
            author
            price
            uploader_id
            uploaded_by {
              _id
              name
              username
            }
          }
        }
      `,
      variables: {
        id: bookIds[0],
      },
    };

    const response = await request(url)
      .post("/graphql")
      .send(findBookByIdQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findBookById).toBeDefined();
    expect(response.body.data.findBookById._id).toBe(bookIds[0]);
    expect(response.body.data.findBookById.uploader_id).toBe(userId);
    expect(response.body.data.findBookById.uploaded_by).toBeDefined();
    expect(response.body.data.findBookById.uploaded_by._id).toBe(userId);
  });

  it("should find all books", async () => {
    const findAllQuery = {
      query: `
        query {
          findAll {
            data {
              _id
              title
              author
            }
            pagination {
              totalCount
              currentPage
            }
          }
        }
      `,
    };

    const response = await request(url).post("/graphql").send(findAllQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findAll).toBeDefined();
    expect(response.body.data.findAll.data).toBeInstanceOf(Array);
    expect(response.body.data.findAll.data.length).toBeGreaterThan(0);
    expect(response.body.data.findAll.pagination).toBeDefined();
  });

  it("should update a book when authenticated as the uploader", async () => {
    const updateBookMutation = {
      query: `
        mutation UpdateBook($id: ID!, $input: UpdateBookInput!) {
          updateBook(id: $id, input: $input) {
            _id
            title
            price
            status
          }
        }
      `,
      variables: {
        id: bookIds[0],
        input: {
          title: "Updated Test Book",
          price: 6000,
          status: "forRent",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(updateBookMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateBook).toBeDefined();
    expect(response.body.data.updateBook.title).toBe("Updated Test Book");
    expect(response.body.data.updateBook.price).toBe(6000);
    expect(response.body.data.updateBook.status).toBe("forRent");
  });

  it("should handle updating a book with invalid data", async () => {
    const updateBookMutation = {
      query: `
        mutation UpdateBook($id: ID!, $input: UpdateBookInput!) {
          updateBook(id: $id, input: $input) {
            _id
            title
          }
        }
      `,
      variables: {
        id: bookIds[0],
        input: {
          cover_type: "invalid_type",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(updateBookMutation);

    expect(response.body.errors).toBeDefined();
  });

  it("should search for books by title or author", async () => {
    const searchQuery = {
      query: `
        query SearchBooks($query: String!) {
          findAll(query: $query) {
            data {
              _id
              title
              author
            }
            pagination {
              totalCount
            }
          }
        }
      `,
      variables: {
        query: "Fantasy",
      },
    };

    const response = await request(url).post("/graphql").send(searchQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findAll).toBeDefined();
    expect(response.body.data.findAll.data).toBeInstanceOf(Array);

    if (response.body.data.findAll.data.length > 0) {
      const hasFantasy = response.body.data.findAll.data.some(
        (book) =>
          book.title.includes("Fantasy") || book.author.includes("Fantasy")
      );
      expect(hasFantasy).toBe(true);
    }
  });

  it("should filter books by various criteria", async () => {
    const filterQuery = {
      query: `
        query FilterBooks($filters: BookFilters!) {
          findAll(filters: $filters) {
            data {
              _id
              title
              price
              cover_type
              status
            }
            pagination {
              totalCount
            }
          }
        }
      `,
      variables: {
        filters: {
          status: "forRent",
          minPrice: 5000,
          cover_type: "hardcover",
        },
      },
    };

    const response = await request(url).post("/graphql").send(filterQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findAll).toBeDefined();
    expect(response.body.data.findAll.data).toBeInstanceOf(Array);

    response.body.data.findAll.data.forEach((book) => {
      expect(book.status).toBe("forRent");
      expect(book.price).toBeGreaterThanOrEqual(5000);
      expect(book.cover_type).toBe("hardcover");
    });
  });

  it("should check if a book is available", async () => {
    const isBookAvailableQuery = {
      query: `
        query IsBookAvailable($id: ID!) {
          isBookAvailable(id: $id)
        }
      `,
      variables: {
        id: bookIds[0],
      },
    };

    const response = await request(url)
      .post("/graphql")
      .send(isBookAvailableQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.isBookAvailable).toBeDefined();
    expect(typeof response.body.data.isBookAvailable).toBe("boolean");
  });

  it("should find books uploaded by the authenticated user", async () => {
    const myBooksQuery = {
      query: `
        query {
          myBooks {
            _id
            title
            author
            uploader_id
          }
        }
      `,
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(myBooksQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.myBooks).toBeDefined();
    expect(response.body.data.myBooks).toBeInstanceOf(Array);
    expect(response.body.data.myBooks.length).toBeGreaterThan(0);

    response.body.data.myBooks.forEach((book) => {
      expect(book.uploader_id).toBe(userId);
    });
  });

  it("should sort and paginate book results", async () => {
    const sortAndPaginateQuery = {
      query: `
        query SortAndPaginate($options: BookOptions!) {
          findAll(options: $options) {
            data {
              _id
              title
              price
            }
            pagination {
              totalCount
              currentPage
              limit
            }
          }
        }
      `,
      variables: {
        options: {
          limit: 2,
          skip: 0,
          sortField: "price",
          sortOrder: -1,
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .send(sortAndPaginateQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findAll).toBeDefined();
    expect(response.body.data.findAll.data).toBeInstanceOf(Array);
    expect(response.body.data.findAll.data.length).toBeLessThanOrEqual(2);

    if (response.body.data.findAll.data.length > 1) {
      expect(response.body.data.findAll.data[0].price).toBeGreaterThanOrEqual(
        response.body.data.findAll.data[1].price
      );
    }

    expect(response.body.data.findAll.pagination.currentPage).toBe(1);
    expect(response.body.data.findAll.pagination.limit).toBe(2);
  });

  it("should fail to update a book when not authenticated as the uploader", async () => {
    const updateBookMutation = {
      query: `
        mutation UpdateBook($id: ID!, $input: UpdateBookInput!) {
          updateBook(id: $id, input: $input) {
            _id
            title
          }
        }
      `,
      variables: {
        id: bookIds[0],
        input: {
          title: "This update should fail",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${secondToken}`)
      .send(updateBookMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("Not authorized");
  });

  it("should fail to delete a book when not authenticated as the uploader", async () => {
    const deleteBookMutation = {
      query: `
        mutation DeleteBook($id: ID!) {
          deleteBook(id: $id)
        }
      `,
      variables: {
        id: bookIds[0],
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${secondToken}`)
      .send(deleteBookMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("Not authorized");
  });

  it("should handle finding a non-existent book", async () => {
    const nonExistentId = "60f1b5b5b5b5b5b5b5b5b5b5";
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
        id: nonExistentId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .send(findBookByIdQuery);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("not found");
  });

  it("should delete a book when authenticated as the uploader", async () => {
    const addBookMutation = {
      query: `
        mutation AddBook($input: AddBookInput!) {
          addBook(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          title: "Book to Delete",
          author: "Delete Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          condition: 7,
          status: "forRent",
          price: 4000,
        },
      },
    };

    const addResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(addBookMutation);

    const bookToDeleteId = addResponse.body.data.addBook._id;

    const deleteBookMutation = {
      query: `
        mutation DeleteBook($id: ID!) {
          deleteBook(id: $id)
        }
      `,
      variables: {
        id: bookToDeleteId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(deleteBookMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteBook).toBeDefined();
    expect(response.body.data.deleteBook).toContain("has been deleted");
  });
});
