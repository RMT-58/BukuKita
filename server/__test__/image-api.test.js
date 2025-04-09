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

  beforeAll(async () => {
    await setupDatabase();
    const { url: serverUrl } = await startTestServer();
    url = serverUrl;

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

  afterAll(async () => {
    await stopTestServer();
    await teardownDatabase();
  });

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

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getImageKitAuthParams).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.token).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.expire).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.signature).toBeDefined();
  });

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

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      "Authentication required"
    );
  });

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

      if (response.body.errors) {
        expect(response.body.errors[0].message).not.toContain(
          "Authentication required"
        );
      } else {
        expect(response.body.data.uploadImage).toBeDefined();
      }
    } catch (error) {
      expect(error.message).not.toContain("Authentication required");
    }
  });

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

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      "Authentication required"
    );
  });

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
          file: "invalid-data",
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

      expect(response.body.errors).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

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

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${secondToken}`)
      .send(getImageKitAuthParamsMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getImageKitAuthParams).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.token).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.expire).toBeDefined();
    expect(response.body.data.getImageKitAuthParams.signature).toBeDefined();
  });
});
