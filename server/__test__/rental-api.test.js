import request from "supertest";
import { startTestServer, stopTestServer } from "../test-utils.js";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";

describe("Rental API Tests", () => {
  let url;
  let token1, token2;
  let userId1, userId2;
  let bookId;
  let rentalId;
  let rentalDetailId;
  let testUsername1, testUsername2;

  // Before all tests, set up the database and start the server
  beforeAll(async () => {
    await setupDatabase();
    const { url: serverUrl } = await startTestServer();
    url = serverUrl;

    // Register primary test user for rental operations
    testUsername1 = `rentaluser_${Date.now()}`;
    const registerMutation1 = {
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
          name: "Rental Test User",
          username: testUsername1,
          password: "password123",
        },
      },
    };

    const registerResponse1 = await request(url)
      .post("/graphql")
      .send(registerMutation1);
    token1 = registerResponse1.body.data.register.token;
    userId1 = registerResponse1.body.data.register.user._id;

    // Register second test user
    testUsername2 = `rentaluser2_${Date.now()}`;
    const registerMutation2 = {
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
          name: "Rental Test User 2",
          username: testUsername2,
          password: "password123",
        },
      },
    };

    const registerResponse2 = await request(url)
      .post("/graphql")
      .send(registerMutation2);
    token2 = registerResponse2.body.data.register.token;
    userId2 = registerResponse2.body.data.register.user._id;

    // Add a test book for rental operations
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
          title: "Rental Test Book",
          author: "Rental Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          condition: 8,
          status: "forRent",
          price: 4000,
        },
      },
    };

    const bookResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(addBookMutation);

    bookId = bookResponse.body.data.addBook._id;
  });

  // After all tests, stop the server and tear down the database
  afterAll(async () => {
    await stopTestServer();
    await teardownDatabase();
  });

  // BASIC RENTAL CRUD OPERATIONS

  // Test creating a rental
  it("should create a new rental when authenticated", async () => {
    const createRentalMutation = {
      query: `
        mutation CreateRental($input: CreateRentalInput!) {
          createRental(input: $input) {
            _id
            user_id
            total_amount
            status
            payment_method
          }
        }
      `,
      variables: {
        input: {
          user_id: userId1,
          total_amount: 12000,
          payment_method: "credit_card",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRentalMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createRental).toBeDefined();
    expect(response.body.data.createRental.user_id).toBe(userId1);
    expect(response.body.data.createRental.total_amount).toBe(12000);
    expect(response.body.data.createRental.status).toBe("pending");
    expect(response.body.data.createRental.payment_method).toBe("credit_card");

    // Save rental ID for later tests
    rentalId = response.body.data.createRental._id;
  });

  // Test creating a rental detail
  it("should create a new rental detail when authenticated", async () => {
    const createRentalDetailMutation = {
      query: `
        mutation CreateRentalDetail($input: CreateRentalDetailInput!) {
          createRentalDetail(input: $input) {
            _id
            book_id
            price
            period
            total
            rental_id
            rental_start
            rental_end
          }
        }
      `,
      variables: {
        input: {
          book_id: bookId,
          price: 4000,
          period: 3,
          title: "Rental Test Book",
          author: "Rental Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          rental_id: rentalId,
          rental_start: new Date().toISOString(),
          rental_end: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRentalDetailMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createRentalDetail).toBeDefined();
    expect(response.body.data.createRentalDetail.book_id).toBe(bookId);
    expect(response.body.data.createRentalDetail.price).toBe(4000);
    expect(response.body.data.createRentalDetail.period).toBe(3);
    expect(response.body.data.createRentalDetail.total).toBe(12000);
    expect(response.body.data.createRentalDetail.rental_id).toBe(rentalId);

    // Save rental detail ID for later tests
    rentalDetailId = response.body.data.createRentalDetail._id;
  });

  // Test finding rentals by user ID
  it("should find rentals by user ID when authenticated", async () => {
    const findRentalsByUserIdQuery = {
      query: `
        query FindRentalsByUserId($userId: String!) {
          findRentalsByUserId(userId: $userId) {
            _id
            user_id
            total_amount
            status
          }
        }
      `,
      variables: {
        userId: userId1,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findRentalsByUserIdQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRentalsByUserId).toBeDefined();
    expect(response.body.data.findRentalsByUserId).toBeInstanceOf(Array);
    expect(response.body.data.findRentalsByUserId.length).toBeGreaterThan(0);
    expect(response.body.data.findRentalsByUserId[0].user_id).toBe(userId1);
  });

  // Test finding a rental by ID
  it("should find a rental by ID when authenticated", async () => {
    const findRentalByIdQuery = {
      query: `
        query FindRentalById($id: ID!) {
          findRentalById(id: $id) {
            _id
            user_id
            total_amount
            status
            payment_method
            details {
              _id
              book_id
              price
              period
            }
          }
        }
      `,
      variables: {
        id: rentalId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findRentalByIdQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRentalById).toBeDefined();
    expect(response.body.data.findRentalById._id).toBe(rentalId);
    expect(response.body.data.findRentalById.user_id).toBe(userId1);
    expect(response.body.data.findRentalById.details).toBeInstanceOf(Array);
    expect(response.body.data.findRentalById.details.length).toBeGreaterThan(0);
  });

  // Test finding all rentals
  it("should find all rentals when authenticated", async () => {
    const findAllRentalsQuery = {
      query: `
        query {
          findAllRentals {
            _id
            user_id
            total_amount
            status
            payment_method
          }
        }
      `,
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findAllRentalsQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findAllRentals).toBeDefined();
    expect(response.body.data.findAllRentals).toBeInstanceOf(Array);
    expect(response.body.data.findAllRentals.length).toBeGreaterThan(0);
  });

  // Test finding a non-existent rental
  it("should handle finding a non-existent rental", async () => {
    const nonExistentId = "60f1b5b5b5b5b5b5b5b5b5b5"; // Non-existent ID
    const findRentalByIdQuery = {
      query: `
        query FindRentalById($id: ID!) {
          findRentalById(id: $id) {
            _id
          }
        }
      `,
      variables: {
        id: nonExistentId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findRentalByIdQuery);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("not found");
  });

  // Test updating rental status
  it("should update rental status when authenticated", async () => {
    const updateRentalStatusMutation = {
      query: `
        mutation UpdateRentalStatus($id: ID!, $input: UpdateRentalStatusInput!) {
          updateRentalStatus(id: $id, input: $input) {
            _id
            status
            payment_method
          }
        }
      `,
      variables: {
        id: rentalId,
        input: {
          status: "completed",
          payment_method: "credit_card",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(updateRentalStatusMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateRentalStatus).toBeDefined();
    expect(response.body.data.updateRentalStatus.status).toBe("completed");
    expect(response.body.data.updateRentalStatus.payment_method).toBe(
      "credit_card"
    );
  });

  // RENTAL DETAIL OPERATIONS

  // Test finding rental details by rental ID
  it("should find rental details by rental ID when authenticated", async () => {
    const findRentalDetailsByRentalIdQuery = {
      query: `
        query FindRentalDetailsByRentalId($rentalId: String!) {
          findRentalDetailsByRentalId(rentalId: $rentalId) {
            _id
            book_id
            price
            period
            total
            rental_id
          }
        }
      `,
      variables: {
        rentalId: rentalId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findRentalDetailsByRentalIdQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRentalDetailsByRentalId).toBeDefined();
    expect(response.body.data.findRentalDetailsByRentalId).toBeInstanceOf(
      Array
    );
    expect(
      response.body.data.findRentalDetailsByRentalId.length
    ).toBeGreaterThan(0);
    expect(response.body.data.findRentalDetailsByRentalId[0].rental_id).toBe(
      rentalId
    );
  });

  // Test finding active rentals by book ID
  it("should find active rentals by book ID when authenticated", async () => {
    const findActiveRentalsByBookIdQuery = {
      query: `
        query FindActiveRentalsByBookId($bookId: String!) {
          findActiveRentalsByBookId(bookId: $bookId) {
            _id
            book_id
            rental_start
            rental_end
          }
        }
      `,
      variables: {
        bookId: bookId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findActiveRentalsByBookIdQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findActiveRentalsByBookId).toBeDefined();
    expect(response.body.data.findActiveRentalsByBookId).toBeInstanceOf(Array);
  });

  // Test finding a specific rental detail
  it("should find a rental detail by ID when authenticated", async () => {
    const findRentalDetailQuery = {
      query: `
        query FindRentalDetail($id: ID!) {
          findRentalDetail(id: $id) {
            _id
            book_id
            price
            period
            total
            rental_id
            rental_start
            rental_end
          }
        }
      `,
      variables: {
        id: rentalDetailId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findRentalDetailQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRentalDetail).toBeDefined();
    expect(response.body.data.findRentalDetail._id).toBe(rentalDetailId);
    expect(response.body.data.findRentalDetail.book_id).toBe(bookId);
    expect(response.body.data.findRentalDetail.rental_id).toBe(rentalId);
  });

  // Test updating a rental detail
  it("should update a rental detail when authenticated", async () => {
    const updateRentalDetailMutation = {
      query: `
        mutation UpdateRentalDetail($id: ID!, $input: UpdateRentalDetailInput!) {
          updateRentalDetail(id: $id, input: $input) {
            _id
            price
            period
            total
          }
        }
      `,
      variables: {
        id: rentalDetailId,
        input: {
          price: 5000,
          period: 4,
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(updateRentalDetailMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateRentalDetail).toBeDefined();
    expect(response.body.data.updateRentalDetail.price).toBe(5000);
    expect(response.body.data.updateRentalDetail.period).toBe(4);
    expect(response.body.data.updateRentalDetail.total).toBe(20000); // 5000 * 4
  });

  // USER-SPECIFIC OPERATIONS

  // Test finding user's own rentals
  it("should find rentals for the authenticated user", async () => {
    const myRentalsQuery = {
      query: `
        query {
          myRentals {
            _id
            user_id
            total_amount
            status
          }
        }
      `,
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(myRentalsQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.myRentals).toBeDefined();
    expect(response.body.data.myRentals).toBeInstanceOf(Array);
    expect(response.body.data.myRentals.length).toBeGreaterThan(0);
    expect(response.body.data.myRentals[0].user_id).toBe(userId1);
  });

  // AUTHORIZATION TESTS

  // Test creating a rental for another user (should fail)
  it("should fail to create a rental for another user", async () => {
    const createRentalMutation = {
      query: `
        mutation CreateRental($input: CreateRentalInput!) {
          createRental(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          user_id: userId2, // Trying to create for user2 while authenticated as user1
          total_amount: 10000,
          payment_method: "credit_card",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRentalMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("Not authorized");
  });

  // Test unauthorized rental status update
  it("should fail to update rental status when not authenticated as the owner", async () => {
    const updateRentalStatusMutation = {
      query: `
        mutation UpdateRentalStatus($id: ID!, $input: UpdateRentalStatusInput!) {
          updateRentalStatus(id: $id, input: $input) {
            _id
            status
          }
        }
      `,
      variables: {
        id: rentalId,
        input: {
          status: "failed",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token2}`)
      .send(updateRentalStatusMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("Not authorized");
  });

  // Test unauthorized rental detail update
  it("should fail to update a rental detail when not authenticated as the owner", async () => {
    const updateRentalDetailMutation = {
      query: `
        mutation UpdateRentalDetail($id: ID!, $input: UpdateRentalDetailInput!) {
          updateRentalDetail(id: $id, input: $input) {
            _id
            price
          }
        }
      `,
      variables: {
        id: rentalDetailId,
        input: {
          price: 6000,
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token2}`)
      .send(updateRentalDetailMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("Not authorized");
  });

  // Test creating a rental detail for another user's rental (should fail)
  it("should fail to create a rental detail for another user's rental", async () => {
    // First create a rental for user2
    const createRentalMutation = {
      query: `
        mutation CreateRental($input: CreateRentalInput!) {
          createRental(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          user_id: userId2,
          total_amount: 10000,
          payment_method: "credit_card",
        },
      },
    };

    const rentalResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token2}`)
      .send(createRentalMutation);

    const user2RentalId = rentalResponse.body.data.createRental._id;

    // Now try to create a rental detail for user2's rental as user1
    const createRentalDetailMutation = {
      query: `
        mutation CreateRentalDetail($input: CreateRentalDetailInput!) {
          createRentalDetail(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          book_id: bookId,
          price: 4000,
          period: 3,
          title: "Rental Test Book",
          author: "Rental Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          rental_id: user2RentalId,
          rental_start: new Date().toISOString(),
          rental_end: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      },
    };

    const detailResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRentalDetailMutation);

    expect(detailResponse.body.errors).toBeDefined();
    expect(detailResponse.body.errors[0].message).toContain("Not authorized");
  });

  // DELETION TESTS

  // Test deleting a rental detail
  it("should delete a rental detail when authenticated as the owner", async () => {
    // First create a new rental detail to delete
    const createRentalDetailMutation = {
      query: `
        mutation CreateRentalDetail($input: CreateRentalDetailInput!) {
          createRentalDetail(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          book_id: bookId,
          price: 4000,
          period: 2,
          title: "Rental Detail to Delete",
          author: "Rental Author",
          genres: ["Fiction"],
          cover_type: "paperback",
          rental_id: rentalId,
          rental_start: new Date().toISOString(),
          rental_end: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      },
    };

    const createResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRentalDetailMutation);

    const detailIdToDelete = createResponse.body.data.createRentalDetail._id;

    // Now delete the rental detail
    const deleteRentalDetailMutation = {
      query: `
        mutation DeleteRentalDetail($id: ID!) {
          deleteRentalDetail(id: $id)
        }
      `,
      variables: {
        id: detailIdToDelete,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteRentalDetailMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteRentalDetail).toBeDefined();
    expect(response.body.data.deleteRentalDetail).toContain("has been deleted");
  });

  // Test deleting a rental
  it("should delete a rental when authenticated as the owner", async () => {
    // First create a new rental to delete
    const createRentalMutation = {
      query: `
        mutation CreateRental($input: CreateRentalInput!) {
          createRental(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          user_id: userId1,
          total_amount: 8000,
          payment_method: "credit_card",
        },
      },
    };

    const createResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRentalMutation);

    const rentalIdToDelete = createResponse.body.data.createRental._id;

    // Now delete the rental
    const deleteRentalMutation = {
      query: `
        mutation DeleteRental($id: ID!) {
          deleteRental(id: $id)
        }
      `,
      variables: {
        id: rentalIdToDelete,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteRentalMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteRental).toBeDefined();
    expect(response.body.data.deleteRental).toContain("has been deleted");
  });

  // Test unauthorized rental deletion
  it("should fail to delete a rental when not authenticated as the owner", async () => {
    const deleteRentalMutation = {
      query: `
        mutation DeleteRental($id: ID!) {
          deleteRental(id: $id)
        }
      `,
      variables: {
        id: rentalId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token2}`)
      .send(deleteRentalMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("Not authorized");
  });
});
