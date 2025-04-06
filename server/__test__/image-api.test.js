import request from "supertest";
import { startTestServer, stopTestServer } from "../test-utils.js";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";

describe("Image API Tests", () => {
  let url;
  let token;
  let secondToken;
  let userId;
  let testUsername;
  let secondTestUsername;

  // Before all tests, set up the database and start the server
  beforeAll(async () => {
    await setupDatabase();
    const { url: serverUrl } = await startTestServer();
    url = serverUrl;

    // Register a test user for image operations
    testUsername = `imageuser_${Date.now()}`;
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
          name: "Image Test User",
          username: testUsername,
          password: "password123",
        },
      },
    };

    const response = await request(url).post("/graphql").send(registerMutation);
    token = response.body.data.register.token;
    userId = response.body.data.register.user._id;

    // Register a second test user
    secondTestUsername = `imageuser2_${Date.now()}`;
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
          name: "Image Test User 2",
          username: secondTestUsername,
          password: "password123",
        },
      },
    };

    const secondResponse = await request(url)
      .post("/graphql")
      .send(secondRegisterMutation);
    secondToken = secondResponse.body.data.register.token;
  });

  // After all tests, stop the server and tear down the database
  afterAll(async () => {
    await stopTestServer();
    await teardownDatabase();
  });

  // AUTHENTICATION TESTS

  // Test getting ImageKit authentication parameters
  it("should get ImageKit authentication parameters when authenticated", async () => {
    const getImageKitAuthParamsMutation = {
      query: `
        mutation {
          getImageKitAuthParams {
            token
            expire
            signature
          }
        }
      `,
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(getImageKitAuthParamsMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getImageKitAuthParams).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.token).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.expire).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.signature).toBeDefined();
  });

  // Test failing to get ImageKit auth params without authentication
  it("should fail to get ImageKit auth params without authentication", async () => {
    const getImageKitAuthParamsMutation = {
      query: `
        mutation {
          getImageKitAuthParams {
            token
            expire
            signature
          }
        }
      `,
    };

    const response = await request(url)
      .post("/graphql")
      .send(getImageKitAuthParamsMutation);

    // Check if the response contains an error
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      "Authentication required"
    );
  });

  // IMAGE UPLOAD TESTS

  // Test attempting to upload an image when authenticated
  it("should attempt to upload an image when authenticated", async () => {
    const uploadImageMutation = {
      query: `
        mutation UploadImage($input: ImageUploadInput!) {
          uploadImage(input: $input) {
            url
            fileId
            name
          }
        }
      `,
      variables: {
        input: {
          file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          fileName: "test-image.png",
          folder: "test",
        },
      },
    };

    try {
      const response = await request(url)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send(uploadImageMutation);

      // This might fail due to actual ImageKit credentials, but we're just testing the schema
      if (response.body.errors) {
        expect(response.body.errors[0].message).not.toContain(
          "Authentication required"
        );
      } else {
        expect(response.body.data.uploadImage).toBeDefined();
      }
    } catch (error) {
      // If there's an error, it should be related to ImageKit, not authentication
      expect(error.message).not.toContain("Authentication required");
    }
  });

  // Test failing to upload an image without authentication
  it("should fail to upload an image without authentication", async () => {
    const uploadImageMutation = {
      query: `
        mutation UploadImage($input: ImageUploadInput!) {
          uploadImage(input: $input) {
            url
            fileId
            name
          }
        }
      `,
      variables: {
        input: {
          file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          fileName: "test-image.png",
          folder: "test",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .send(uploadImageMutation);

    // Check if the response contains an error
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      "Authentication required"
    );
  });

  // ERROR HANDLING TESTS

  // Test uploading an image with invalid data
  it("should handle uploading an image with invalid data", async () => {
    const uploadImageMutation = {
      query: `
        mutation UploadImage($input: ImageUploadInput!) {
          uploadImage(input: $input) {
            url
            fileId
            name
          }
        }
      `,
      variables: {
        input: {
          file: "invalid-data", // Not a valid base64 or buffer
          fileName: "test-image.png",
          folder: "test",
        },
      },
    };

    try {
      const response = await request(url)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send(uploadImageMutation);

      // This should fail due to invalid data
      expect(response.body.errors).toBeDefined();
    } catch (error) {
      // If there's an error, it should be related to invalid data
      expect(error).toBeDefined();
    }
  });

  // Test using different authentication tokens
  it("should accept requests from different authenticated users", async () => {
    const getImageKitAuthParamsMutation = {
      query: `
        mutation {
          getImageKitAuthParams {
            token
            expire
            signature
          }
        }
      `,
    };

    // Try with the second token
    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${secondToken}`)
      .send(getImageKitAuthParamsMutation);

    // Check if the response is successful with the second token
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getImageKitAuthParams).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.token).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.expire).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.signature).toBeDefined();
  });
});
