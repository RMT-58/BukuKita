import request from "supertest";
import { startTestServer, stopTestServer } from "../test-utils.js";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";
import { ObjectId } from "mongodb";

describe("User API & Schema Tests", () => {
  let url;
  let token, token1, token2;
  let userId, userId1, userId2;
  let testUsername, testUsername1, testUsername2;

  beforeAll(async () => {
    await setupDatabase();
    const { url: serverUrl } = await startTestServer();
    url = serverUrl;

    testUsername = `testuser_${Date.now()}`;
    testUsername1 = `userschemauser1_${Date.now() + 1}`;
    testUsername2 = `userschemauser2_${Date.now() + 2}`;
  });

  afterAll(async () => {
    await stopTestServer();
    await teardownDatabase();
  });

  it("should register a new user", async () => {
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
    };

    const response = await request(url).post("/graphql").send(registerMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.register).toBeDefined();
    expect(response.body.data.register.token).toBeDefined();
    expect(response.body.data.register.user).toBeDefined();
    expect(response.body.data.register.user.name).toBe("Test User");

    token = response.body.data.register.token;
    userId = response.body.data.register.user._id;
  });

  it("should login an existing user", async () => {
    const loginMutation = {
      query: `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              _id
              username
            }
          }
        }
      `,
      variables: {
        input: {
          username: testUsername,
          password: "password123",
        },
      },
    };

    const response = await request(url).post("/graphql").send(loginMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.login).toBeDefined();
    expect(response.body.data.login.token).toBeDefined();
    expect(response.body.data.login.user).toBeDefined();
    expect(response.body.data.login.user.username).toBe(testUsername);
  });

  it("should return the current user profile when authenticated", async () => {
    const meQuery = {
      query: `
        query {
          me {
            _id
            name
            username
          }
        }
      `,
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(meQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.me).toBeDefined();
    expect(response.body.data.me._id).toBe(userId);
    expect(response.body.data.me.username).toBe(testUsername);
  });

  it("should find a user by ID when authenticated", async () => {
    const findUserByIdQuery = {
      query: `
        query FindUserById($id: ID!) {
          findUserById(id: $id) {
            _id
            name
            username
          }
        }
      `,
      variables: {
        id: userId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(findUserByIdQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findUserById).toBeDefined();
    expect(response.body.data.findUserById._id).toBe(userId);
    expect(response.body.data.findUserById.username).toBe(testUsername);
  });

  it("should update user profile when authenticated", async () => {
    const updateUserMutation = {
      query: `
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(input: $input) {
            _id
            name
            phone_number
            address
          }
        }
      `,
      variables: {
        input: {
          name: "Updated User Name",
          phone_number: "9876543210",
          address: "123 Updated St",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(updateUserMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateUser).toBeDefined();
    expect(response.body.data.updateUser.name).toBe("Updated User Name");
    expect(response.body.data.updateUser.phone_number).toBe("9876543210");
    expect(response.body.data.updateUser.address).toBe("123 Updated St");
  });

  it("should update password when authenticated", async () => {
    const updatePasswordMutation = {
      query: `
        mutation UpdatePassword($input: UpdatePasswordInput!) {
          updatePassword(input: $input) {
            _id
            username
          }
        }
      `,
      variables: {
        input: {
          currentPassword: "password123",
          newPassword: "newpassword123",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(updatePasswordMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updatePassword).toBeDefined();

    if (
      response.body.data.updatePassword &&
      response.body.data.updatePassword._id
    ) {
      expect(response.body.data.updatePassword._id).toBe(userId);
    }

    const loginMutation = {
      query: `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              _id
            }
          }
        }
      `,
      variables: {
        input: {
          username: testUsername,
          password: "newpassword123",
        },
      },
    };

    const loginResponse = await request(url)
      .post("/graphql")
      .send(loginMutation);
    expect(loginResponse.body.errors).toBeUndefined();
    expect(loginResponse.body.data.login).toBeDefined();
    expect(loginResponse.body.data.login.user._id).toBe(userId);
  });

  it("should register two additional test users", async () => {
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
          name: "User Schema Test User 1",
          username: testUsername1,
          password: "password123",
        },
      },
    };

    const response1 = await request(url)
      .post("/graphql")
      .send(registerMutation1);
    token1 = response1.body.data.register.token;
    userId1 = response1.body.data.register.user._id;

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
          name: "User Schema Test User 2",
          username: testUsername2,
          password: "password123",
        },
      },
    };

    const response2 = await request(url)
      .post("/graphql")
      .send(registerMutation2);
    token2 = response2.body.data.register.token;
    userId2 = response2.body.data.register.user._id;

    expect(userId1).toBeDefined();
    expect(userId2).toBeDefined();
    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
  });

  it("should handle finding a non-existent user", async () => {
    const nonExistentId = new ObjectId().toString();

    const findUserByIdQuery = {
      query: `
        query FindUserById($id: ID!) {
          findUserById(id: $id) {
            _id
            name
            username
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
      .send(findUserByIdQuery);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      `User with ID ${nonExistentId} not found`
    );
  });

  it("should fail to delete another user's account", async () => {
    const deleteUserMutation = {
      query: `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id)
        }
      `,
      variables: {
        id: userId2,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteUserMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      "Not authorized to delete other users"
    );
  });

  it("should delete user when authenticated", async () => {
    const deleteUserMutation = {
      query: `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id)
        }
      `,
      variables: {
        id: userId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send(deleteUserMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteUser).toBeDefined();
    expect(response.body.data.deleteUser).toContain("has been deleted");

    await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        query: `
          mutation DeleteUser($id: ID!) {
            deleteUser(id: $id)
          }
        `,
        variables: {
          id: userId1,
        },
      });

    await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        query: `
          mutation DeleteUser($id: ID!) {
            deleteUser(id: $id)
          }
        `,
        variables: {
          id: userId2,
        },
      });
  });
});
