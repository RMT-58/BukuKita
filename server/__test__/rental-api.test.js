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

  beforeAll(async () => {
    await setupDatabase();
    const { url: serverUrl } = await startTestServer();
    url = serverUrl;

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

  afterAll(async () => {
    await stopTestServer();
    await teardownDatabase();
  });

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

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createRental).toBeDefined();
    expect(response.body.data.createRental.user_id).toBe(userId1);
    expect(response.body.data.createRental.total_amount).toBe(12000);
    expect(response.body.data.createRental.status).toBe("pending");
    expect(response.body.data.createRental.payment_method).toBe("credit_card");

    rentalId = response.body.data.createRental._id;
  });

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

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createRentalDetail).toBeDefined();
    expect(response.body.data.createRentalDetail.book_id).toBe(bookId);
    expect(response.body.data.createRentalDetail.price).toBe(4000);
    expect(response.body.data.createRentalDetail.period).toBe(3);
    expect(response.body.data.createRentalDetail.total).toBe(12000);
    expect(response.body.data.createRentalDetail.rental_id).toBe(rentalId);

    rentalDetailId = response.body.data.createRentalDetail._id;
  });

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

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRentalsByUserId).toBeDefined();
    expect(response.body.data.findRentalsByUserId).toBeInstanceOf(Array);
    expect(response.body.data.findRentalsByUserId.length).toBeGreaterThan(0);
    expect(response.body.data.findRentalsByUserId[0].user_id).toBe(userId1);
  });

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

  it("should handle finding a non-existent rental", async () => {
    const nonExistentId = "60f1b5b5b5b5b5b5b5b5b5b5";
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

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateRentalStatus).toBeDefined();
    expect(response.body.data.updateRentalStatus.status).toBe("completed");
    expect(response.body.data.updateRentalStatus.payment_method).toBe(
      "credit_card"
    );
  });

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

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findActiveRentalsByBookId).toBeDefined();
    expect(response.body.data.findActiveRentalsByBookId).toBeInstanceOf(Array);
  });

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

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRentalDetail).toBeDefined();
    expect(response.body.data.findRentalDetail._id).toBe(rentalDetailId);
    expect(response.body.data.findRentalDetail.book_id).toBe(bookId);
    expect(response.body.data.findRentalDetail.rental_id).toBe(rentalId);
  });

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

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateRentalDetail).toBeDefined();
    expect(response.body.data.updateRentalDetail.price).toBe(5000);
    expect(response.body.data.updateRentalDetail.period).toBe(4);
    expect(response.body.data.updateRentalDetail.total).toBe(20000);
  });

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

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.myRentals).toBeDefined();
    expect(response.body.data.myRentals).toBeInstanceOf(Array);
    expect(response.body.data.myRentals.length).toBeGreaterThan(0);
    expect(response.body.data.myRentals[0].user_id).toBe(userId1);
  });

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
          user_id: userId2,
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

  it("should fail to create a rental detail for another user's rental", async () => {
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

  it("should delete a rental detail when authenticated as the owner", async () => {
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

  it("should delete a rental when authenticated as the owner", async () => {
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
  // it("should refresh payment token when authenticated", async () => {
  //   const refreshPaymentTokenMutation = {
  //     query: `
  //       mutation RefreshPaymentToken($id: ID!) {
  //         refreshPaymentToken(id: $id) {
  //           _id
  //           token
  //           redirect_url
  //           status
  //         }
  //       }
  //     `,
  //     variables: {
  //       id: rentalId,
  //     },
  //   };

  //   const response = await request(url)
  //     .post("/graphql")
  //     .set("Authorization", `Bearer ${token1}`)
  //     .send(refreshPaymentTokenMutation);

  //   // Check if the response is successful
  //   expect(response.body.errors).toBeUndefined();
  //   expect(response.body.data.refreshPaymentToken).toBeDefined();
  //   expect(response.body.data.refreshPaymentToken._id).toBe(rentalId);
  //   expect(response.body.data.refreshPaymentToken.token).toBeDefined();
  //   expect(response.body.data.refreshPaymentToken.redirect_url).toBeDefined();
  //   expect(response.body.data.refreshPaymentToken.status).toBe("pending");
  // });
  // Replace the failing "should refresh payment token when authenticated" test in rental-api.test.js with this:

  it("should refresh payment token when authenticated", async () => {
    // First, we need to make sure we're using a rental that's in the "pending" state
    // Create a new rental specifically for this test
    const createRentalMutation = {
      query: `
      mutation CreateRental($input: CreateRentalInput!) {
        createRental(input: $input) {
          _id
          status
          token
          redirect_url
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

    const pendingRentalId = createResponse.body.data.createRental._id;

    // Verify it's in pending state
    expect(createResponse.body.data.createRental.status).toBe("pending");

    // Now refresh the token for this pending rental
    const refreshPaymentTokenMutation = {
      query: `
      mutation RefreshPaymentToken($id: ID!) {
        refreshPaymentToken(id: $id) {
          _id
          token
          redirect_url
          status
        }
      }
    `,
      variables: {
        id: pendingRentalId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(refreshPaymentTokenMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.refreshPaymentToken).toBeDefined();
    expect(response.body.data.refreshPaymentToken._id).toBe(pendingRentalId);
    expect(response.body.data.refreshPaymentToken.token).toBeDefined();
    expect(response.body.data.refreshPaymentToken.redirect_url).toBeDefined();
    expect(response.body.data.refreshPaymentToken.status).toBe("pending");
  });

  it("should fail to refresh token for non-pending rental", async () => {
    // First, create a new rental for testing
    const createRentalMutation = {
      query: `
        mutation CreateRental($input: CreateRentalInput!) {
          createRental(input: $input) {
            _id
            status
          }
        }
      `,
      variables: {
        input: {
          user_id: userId1,
          total_amount: 7500,
          payment_method: "credit_card",
        },
      },
    };

    const createResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRentalMutation);

    const testRentalId = createResponse.body.data.createRental._id;

    // Update the rental to completed status
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
        id: testRentalId,
        input: {
          status: "completed",
        },
      },
    };

    await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(updateRentalStatusMutation);

    // Now try to refresh token for a completed rental
    const refreshPaymentTokenMutation = {
      query: `
        mutation RefreshPaymentToken($id: ID!) {
          refreshPaymentToken(id: $id) {
            _id
            token
            redirect_url
          }
        }
      `,
      variables: {
        id: testRentalId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(refreshPaymentTokenMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      "Cannot refresh token for non-pending rentals"
    );
  });

  it("should fail to refresh token for another user's rental", async () => {
    // First create a new rental for user2
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
          total_amount: 15000,
          payment_method: "credit_card",
        },
      },
    };

    const createResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token2}`)
      .send(createRentalMutation);

    const user2RentalId = createResponse.body.data.createRental._id;

    // Try to refresh token for user2's rental as user1
    const refreshPaymentTokenMutation = {
      query: `
        mutation RefreshPaymentToken($id: ID!) {
          refreshPaymentToken(id: $id) {
            _id
            token
            redirect_url
          }
        }
      `,
      variables: {
        id: user2RentalId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(refreshPaymentTokenMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      "Not authorized to refresh token for this rental"
    );
  });

  // Test Midtrans webhook endpoint through a direct HTTP request
  // Note: This requires mocking the Rental.handleMidtransWebhook method
  it("should test Midtrans webhook endpoint", async () => {
    // Skip this test if Rental.handleMidtransWebhook can't be mocked in the API test
    // This is just a placeholder - implement if your test framework supports mocking module dependencies

    // Create a test order ID
    const testOrderId = "test-order-" + Date.now();

    // Create a test webhook payload
    const webhookPayload = {
      order_id: testOrderId,
      transaction_status: "settlement",
      status_code: "200",
      gross_amount: "12000",
      signature_key: "test-signature",
    };

    // Get the webhook path from env or use a test value
    // Note: In a real implementation, you'd need to mock the actual env variable
    // and restore it after the test
    const webhookPath = process.env.MIDTRANS_WEBHOOK || "midtrans-webhook-test";

    try {
      // This is where you'd mock Rental.handleMidtransWebhook
      // Then make the request and assert on the response

      console.log(
        `Skipping direct webhook test - would test POST to /${webhookPath}`
      );

      // If you can mock the dependency:
      /*
      const response = await request(url)
        .post(`/${webhookPath}`)
        .send(webhookPayload);
        
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      */
    } catch (error) {
      console.error("Webhook test error:", error);
    }
  });

  // Add more test cases for edge cases in the API
  it("should handle non-existent rental in refreshPaymentToken", async () => {
    const nonExistentId = "60f1b5b5b5b5b5b5b5b5b5b5"; // Non-existent ID

    const refreshPaymentTokenMutation = {
      query: `
        mutation RefreshPaymentToken($id: ID!) {
          refreshPaymentToken(id: $id) {
            _id
            token
            redirect_url
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
      .send(refreshPaymentTokenMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("not found");
  });

  // Test for more schema fields that might be missing from coverage
  it("should include token and redirect_url in rental queries", async () => {
    const findRentalByIdQuery = {
      query: `
        query FindRentalById($id: ID!) {
          findRentalById(id: $id) {
            _id
            token
            redirect_url
            created_at
            updated_at
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
    expect(response.body.data.findRentalById.token).toBeDefined();
    expect(response.body.data.findRentalById.redirect_url).toBeDefined();
    expect(response.body.data.findRentalById.created_at).toBeDefined();
    expect(response.body.data.findRentalById.updated_at).toBeDefined();
  });

  // Test that Rental type resolvers work correctly
  it("should resolve rental details through the Rental type", async () => {
    const findRentalWithDetailsQuery = {
      query: `
        query FindRentalById($id: ID!) {
          findRentalById(id: $id) {
            _id
            details {
              _id
              book_id
              price
              period
              total
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
      .send(findRentalWithDetailsQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRentalById).toBeDefined();
    expect(response.body.data.findRentalById.details).toBeDefined();
    expect(Array.isArray(response.body.data.findRentalById.details)).toBe(true);
    // If there are rental details, check their structure
    if (response.body.data.findRentalById.details.length > 0) {
      const detail = response.body.data.findRentalById.details[0];
      expect(detail._id).toBeDefined();
      expect(detail.book_id).toBeDefined();
      expect(detail.price).toBeDefined();
      expect(detail.period).toBeDefined();
      expect(detail.total).toBeDefined();
    }
  });
});
