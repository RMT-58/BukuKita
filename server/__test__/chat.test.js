import { createApolloServer } from "../index.js";
import request from "supertest";
import dotenv from "dotenv";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";

// Load environment variables
dotenv.config();

describe("Room and Chat API Tests", () => {
  let server, url;
  let token1, token2; // Tokens for two different users to test authorization
  let userId1, userId2; // IDs for two different users
  let roomId; // To store the room ID after creation
  let chatId; // To store the chat ID after creation
  let testUsername1, testUsername2; // To store the usernames for login tests

  // Before all tests, create a new Apollo Server instance and set up test data
  beforeAll(async () => {
    ({ server, url } = await createApolloServer({ port: 0 }));
    url = new URL(url).origin; // Extract just the origin part of the URL

    // Register first test user
    testUsername1 = `testuser1_${Date.now()}`;
    const registerMutation1 = {
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
          name: "Test User 1",
          username: testUsername1,
          password: "password123",
          phone_number: "1234567890",
          address: "123 Test St",
        },
      },
    };

    const registerResponse1 = await request(url)
      .post("/")
      .send(registerMutation1);
    token1 = registerResponse1.body.data.register.token;
    userId1 = registerResponse1.body.data.register.user._id;

    // Register second test user for authorization tests
    testUsername2 = `testuser2_${Date.now()}`;
    const registerMutation2 = {
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
          name: "Test User 2",
          username: testUsername2,
          password: "password123",
          phone_number: "0987654321",
          address: "456 Test Ave",
        },
      },
    };

    const registerResponse2 = await request(url)
      .post("/")
      .send(registerMutation2);
    token2 = registerResponse2.body.data.register.token;
    userId2 = registerResponse2.body.data.register.user._id;
  });

  // After all tests, clean up test data and stop the server
  afterAll(async () => {
    // Clean up - delete the test chat if it exists
    if (chatId) {
      const deleteChatMutation = {
        query: `
          mutation DeleteChat($id: ID!) {
            deleteChat(id: $id)
          }
        `,
        variables: {
          id: chatId,
        },
      };

      await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token1}`)
        .send(deleteChatMutation);
    }

    // Clean up - delete the test room if it exists
    if (roomId) {
      const deleteRoomMutation = {
        query: `
          mutation DeleteRoom($id: ID!) {
            deleteRoom(id: $id)
          }
        `,
        variables: {
          id: roomId,
        },
      };

      await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token1}`)
        .send(deleteRoomMutation);
    }

    // Delete the test users
    if (userId1) {
      const deleteUserMutation1 = {
        query: `
          mutation DeleteUser($id: ID!) {
            deleteUser(id: $id)
          }
        `,
        variables: {
          id: userId1,
        },
      };

      await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token1}`)
        .send(deleteUserMutation1);
    }

    if (userId2) {
      const deleteUserMutation2 = {
        query: `
          mutation DeleteUser($id: ID!) {
            deleteUser(id: $id)
          }
        `,
        variables: {
          id: userId2,
        },
      };

      await request(url)
        .post("/")
        .set("Authorization", `Bearer ${token2}`)
        .send(deleteUserMutation2);
    }

    await server?.stop();
  });

  // Test creating a room (requires authentication)
  it("should create a new room when authenticated", async () => {
    const createRoomMutation = {
      query: `
        mutation CreateRoom($input: CreateRoomInput!) {
          createRoom(input: $input) {
            _id
            user_id
            created_at
            updated_at
          }
        }
      `,
      variables: {
        input: {
          user_id: userId1,
        },
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRoomMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createRoom).toBeDefined();
    expect(response.body.data.createRoom.user_id).toBe(userId1);

    // Save room ID for later tests
    roomId = response.body.data.createRoom._id;
  });

  // Test finding all rooms (requires authentication)
  it("should find all rooms when authenticated", async () => {
    const findAllRoomsQuery = {
      query: `
        query {
          findAllRooms {
            _id
            user_id
            created_at
            updated_at
          }
        }
      `,
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(findAllRoomsQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findAllRooms).toBeDefined();
    expect(Array.isArray(response.body.data.findAllRooms)).toBe(true);

    // Our test room should be in the results
    if (roomId) {
      const testRoom = response.body.data.findAllRooms.find(
        (room) => room._id === roomId
      );
      expect(testRoom).toBeDefined();
      expect(testRoom.user_id).toBe(userId1);
    }
  });

  // Test finding a room by ID (requires authentication)
  it("should find a room by ID when authenticated", async () => {
    // Skip this test if we don't have a room ID
    if (!roomId) {
      console.log("Skipping findRoomById test because no room was created");
      return;
    }

    const findRoomByIdQuery = {
      query: `
        query FindRoomById($id: ID!) {
          findRoomById(id: $id) {
            _id
            user_id
            created_at
            updated_at
            user {
              _id
              name
              username
            }
          }
        }
      `,
      variables: {
        id: roomId,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(findRoomByIdQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRoomById).toBeDefined();
    expect(response.body.data.findRoomById._id).toBe(roomId);
    expect(response.body.data.findRoomById.user_id).toBe(userId1);
    expect(response.body.data.findRoomById.user).toBeDefined();
    expect(response.body.data.findRoomById.user._id).toBe(userId1);
    expect(response.body.data.findRoomById.user.username).toBe(testUsername1);
  });

  // Test finding rooms by user ID (requires authentication)
  it("should find rooms by user ID when authenticated", async () => {
    const findRoomsByUserIdQuery = {
      query: `
        query FindRoomsByUserId($userId: String!) {
          findRoomsByUserId(userId: $userId) {
            _id
            user_id
            created_at
            updated_at
          }
        }
      `,
      variables: {
        userId: userId1,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(findRoomsByUserIdQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRoomsByUserId).toBeDefined();
    expect(Array.isArray(response.body.data.findRoomsByUserId)).toBe(true);

    // Our test room should be in the results
    if (roomId) {
      const testRoom = response.body.data.findRoomsByUserId.find(
        (room) => room._id === roomId
      );
      expect(testRoom).toBeDefined();
      expect(testRoom.user_id).toBe(userId1);
    }
  });

  // Test getting my rooms (requires authentication)
  it("should get my rooms when authenticated", async () => {
    const myRoomsQuery = {
      query: `
        query {
          myRooms {
            _id
            user_id
            created_at
            updated_at
          }
        }
      `,
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(myRoomsQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.myRooms).toBeDefined();
    expect(Array.isArray(response.body.data.myRooms)).toBe(true);

    // Our test room should be in the results
    if (roomId) {
      const testRoom = response.body.data.myRooms.find(
        (room) => room._id === roomId
      );
      expect(testRoom).toBeDefined();
      expect(testRoom.user_id).toBe(userId1);
    }
  });

  // Test creating a chat (requires authentication)
  it("should create a new chat when authenticated", async () => {
    // Skip this test if we don't have a room ID
    if (!roomId) {
      console.log("Skipping createChat test because no room was created");
      return;
    }

    const createChatMutation = {
      query: `
        mutation CreateChat($input: CreateChatInput!) {
          createChat(input: $input) {
            _id
            sender_id
            receiver_id
            message
            room_id
            created_at
            updated_at
          }
        }
      `,
      variables: {
        input: {
          sender_id: userId1,
          receiver_id: userId2,
          message: "Hello, this is a test message!",
          room_id: roomId,
        },
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(createChatMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createChat).toBeDefined();
    expect(response.body.data.createChat.sender_id).toBe(userId1);
    expect(response.body.data.createChat.receiver_id).toBe(userId2);
    expect(response.body.data.createChat.message).toBe(
      "Hello, this is a test message!"
    );
    expect(response.body.data.createChat.room_id).toBe(roomId);

    // Save chat ID for later tests
    chatId = response.body.data.createChat._id;
  });

  // Test finding all chats (requires authentication)
  it("should find all chats when authenticated", async () => {
    const findAllChatsQuery = {
      query: `
        query {
          findAllChats {
            _id
            sender_id
            receiver_id
            message
            room_id
            created_at
            updated_at
          }
        }
      `,
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(findAllChatsQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findAllChats).toBeDefined();
    expect(Array.isArray(response.body.data.findAllChats)).toBe(true);

    // Our test chat should be in the results
    if (chatId) {
      const testChat = response.body.data.findAllChats.find(
        (chat) => chat._id === chatId
      );
      expect(testChat).toBeDefined();
      expect(testChat.sender_id).toBe(userId1);
      expect(testChat.receiver_id).toBe(userId2);
      expect(testChat.room_id).toBe(roomId);
    }
  });

  // Test finding a chat by ID (requires authentication)
  it("should find a chat by ID when authenticated", async () => {
    // Skip this test if we don't have a chat ID
    if (!chatId) {
      console.log("Skipping findChatById test because no chat was created");
      return;
    }

    const findChatByIdQuery = {
      query: `
        query FindChatById($id: ID!) {
          findChatById(id: $id) {
            _id
            sender_id
            receiver_id
            message
            room_id
            created_at
            updated_at
            sender {
              _id
              name
              username
            }
            receiver {
              _id
              name
              username
            }
          }
        }
      `,
      variables: {
        id: chatId,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(findChatByIdQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findChatById).toBeDefined();
    expect(response.body.data.findChatById._id).toBe(chatId);
    expect(response.body.data.findChatById.sender_id).toBe(userId1);
    expect(response.body.data.findChatById.receiver_id).toBe(userId2);
    expect(response.body.data.findChatById.message).toBe(
      "Hello, this is a test message!"
    );
    expect(response.body.data.findChatById.room_id).toBe(roomId);
    expect(response.body.data.findChatById.sender).toBeDefined();
    expect(response.body.data.findChatById.sender._id).toBe(userId1);
    expect(response.body.data.findChatById.sender.username).toBe(testUsername1);
    expect(response.body.data.findChatById.receiver).toBeDefined();
    expect(response.body.data.findChatById.receiver._id).toBe(userId2);
    expect(response.body.data.findChatById.receiver.username).toBe(
      testUsername2
    );
  });

  // Test finding chats by room ID (requires authentication)
  it("should find chats by room ID when authenticated", async () => {
    // Skip this test if we don't have a room ID
    if (!roomId) {
      console.log(
        "Skipping findChatsByRoomId test because no room was created"
      );
      return;
    }

    const findChatsByRoomIdQuery = {
      query: `
        query FindChatsByRoomId($roomId: String!) {
          findChatsByRoomId(roomId: $roomId) {
            _id
            sender_id
            receiver_id
            message
            room_id
            created_at
            updated_at
          }
        }
      `,
      variables: {
        roomId: roomId,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(findChatsByRoomIdQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findChatsByRoomId).toBeDefined();
    expect(Array.isArray(response.body.data.findChatsByRoomId)).toBe(true);

    // Our test chat should be in the results
    if (chatId) {
      const testChat = response.body.data.findChatsByRoomId.find(
        (chat) => chat._id === chatId
      );
      expect(testChat).toBeDefined();
      expect(testChat.sender_id).toBe(userId1);
      expect(testChat.receiver_id).toBe(userId2);
      expect(testChat.room_id).toBe(roomId);
    }
  });

  // Test finding chats between users (requires authentication)
  it("should find chats between users when authenticated", async () => {
    const findChatsBetweenUsersQuery = {
      query: `
        query FindChatsBetweenUsers($senderId: String!, $receiverId: String!) {
          findChatsBetweenUsers(senderId: $senderId, receiverId: $receiverId) {
            _id
            sender_id
            receiver_id
            message
            room_id
            created_at
            updated_at
          }
        }
      `,
      variables: {
        senderId: userId1,
        receiverId: userId2,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(findChatsBetweenUsersQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findChatsBetweenUsers).toBeDefined();
    expect(Array.isArray(response.body.data.findChatsBetweenUsers)).toBe(true);

    // Our test chat should be in the results
    if (chatId) {
      const testChat = response.body.data.findChatsBetweenUsers.find(
        (chat) => chat._id === chatId
      );
      expect(testChat).toBeDefined();
      expect(testChat.sender_id).toBe(userId1);
      expect(testChat.receiver_id).toBe(userId2);
    }
  });

  // Test getting my chats (requires authentication)
  it("should get my chats when authenticated", async () => {
    const myChatsQuery = {
      query: `
        query {
          myChats {
            _id
            sender_id
            receiver_id
            message
            room_id
            created_at
            updated_at
          }
        }
      `,
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(myChatsQuery);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.myChats).toBeDefined();
    expect(Array.isArray(response.body.data.myChats)).toBe(true);

    // Our test chat should be in the results
    if (chatId) {
      const testChat = response.body.data.myChats.find(
        (chat) => chat._id === chatId
      );
      expect(testChat).toBeDefined();
      expect(testChat.sender_id).toBe(userId1);
      expect(testChat.receiver_id).toBe(userId2);
    }
  });

  // Test updating a chat (requires authentication and authorization)
  it("should update a chat when authenticated and authorized", async () => {
    // Skip this test if we don't have a chat ID
    if (!chatId) {
      console.log("Skipping updateChat test because no chat was created");
      return;
    }

    const updateChatMutation = {
      query: `
        mutation UpdateChat($id: ID!, $input: UpdateChatInput!) {
          updateChat(id: $id, input: $input) {
            _id
            sender_id
            receiver_id
            message
            room_id
            updated_at
          }
        }
      `,
      variables: {
        id: chatId,
        input: {
          message: "This message has been updated!",
        },
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(updateChatMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateChat).toBeDefined();
    expect(response.body.data.updateChat._id).toBe(chatId);
    expect(response.body.data.updateChat.message).toBe(
      "This message has been updated!"
    );
  });

  // Test sending a message (requires authentication)
  it("should send a message when authenticated", async () => {
    const sendMessageMutation = {
      query: `
        mutation SendMessage($receiverId: String!, $message: String!) {
          sendMessage(receiverId: $receiverId, message: $message) {
            _id
            sender_id
            receiver_id
            message
            room_id
            created_at
            updated_at
          }
        }
      `,
      variables: {
        receiverId: userId2,
        message: "This is a direct message!",
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(sendMessageMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendMessage).toBeDefined();
    expect(response.body.data.sendMessage.sender_id).toBe(userId1);
    expect(response.body.data.sendMessage.receiver_id).toBe(userId2);
    expect(response.body.data.sendMessage.message).toBe(
      "This is a direct message!"
    );
    expect(response.body.data.sendMessage.room_id).toBeDefined();
  });

  // Test deleting a chat (requires authentication and authorization)
  it("should delete a chat when authenticated and authorized", async () => {
    // Skip this test if we don't have a chat ID
    if (!chatId) {
      console.log("Skipping deleteChat test because no chat was created");
      return;
    }

    const deleteChatMutation = {
      query: `
        mutation DeleteChat($id: ID!) {
          deleteChat(id: $id)
        }
      `,
      variables: {
        id: chatId,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteChatMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteChat).toBeDefined();
    expect(response.body.data.deleteChat).toContain(chatId);

    // Verify the chat is deleted by trying to fetch it
    const findChatByIdQuery = {
      query: `
        query FindChatById($id: ID!) {
          findChatById(id: $id) {
            _id
          }
        }
      `,
      variables: {
        id: chatId,
      },
    };

    const verifyResponse = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(findChatByIdQuery);

    // The chat should not be found
    expect(verifyResponse.body.errors).toBeDefined();
    expect(verifyResponse.body.errors[0].message).toContain("not found");

    // Set chatId to null since we've deleted it
    chatId = null;
  });

  // Test deleting a room (requires authentication and authorization)
  it("should delete a room when authenticated and authorized", async () => {
    // Skip this test if we don't have a room ID
    if (!roomId) {
      console.log("Skipping deleteRoom test because no room was created");
      return;
    }

    const deleteRoomMutation = {
      query: `
        mutation DeleteRoom($id: ID!) {
          deleteRoom(id: $id)
        }
      `,
      variables: {
        id: roomId,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteRoomMutation);

    // Check if the response is successful
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteRoom).toBeDefined();
    expect(response.body.data.deleteRoom).toContain(roomId);

    // Verify the room is deleted by trying to fetch it
    const findRoomByIdQuery = {
      query: `
        query FindRoomById($id: ID!) {
          findRoomById(id: $id) {
            _id
          }
        }
      `,
      variables: {
        id: roomId,
      },
    };

    const verifyResponse = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(findRoomByIdQuery);

    // The room should not be found
    expect(verifyResponse.body.errors).toBeDefined();
    expect(verifyResponse.body.errors[0].message).toContain("not found");

    // Set roomId to null since we've deleted it
    roomId = null;
  });

  // EDGE CASES AND ERROR SCENARIOS

  // Test creating a room without authentication (should fail)
  it("should fail to create a room without authentication", async () => {
    const createRoomMutation = {
      query: `
        mutation CreateRoom($input: CreateRoomInput!) {
          createRoom(input: $input) {
            _id
            user_id
          }
        }
      `,
      variables: {
        input: {
          user_id: userId1,
        },
      },
    };

    const response = await request(url).post("/").send(createRoomMutation);

    // Check if the response contains an authentication error
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      "Authentication required"
    );
  });

  // Test creating a chat without authentication (should fail)
  it("should fail to create a chat without authentication", async () => {
    // Skip this test if we don't have a room ID
    if (!roomId) {
      console.log(
        "Skipping unauthorized createChat test because no room was created"
      );
      return;
    }

    const createChatMutation = {
      query: `
        mutation CreateChat($input: CreateChatInput!) {
          createChat(input: $input) {
            _id
            sender_id
            receiver_id
            message
          }
        }
      `,
      variables: {
        input: {
          sender_id: userId1,
          receiver_id: userId2,
          message: "Unauthorized message",
          room_id: "fake_room_id",
        },
      },
    };

    const response = await request(url).post("/").send(createChatMutation);

    // Check if the response contains an authentication error
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      "Authentication required"
    );
  });

  // Test updating a chat as a different user (should fail)
  it("should fail to update a chat as a different user", async () => {
    // Create a new chat as user1
    const createChatMutation = {
      query: `
        mutation CreateRoom($input: CreateRoomInput!) {
          createRoom(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          user_id: userId1,
        },
      },
    };

    const roomResponse = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(createChatMutation);

    const newRoomId = roomResponse.body.data.createRoom._id;

    const createChatMutation2 = {
      query: `
        mutation CreateChat($input: CreateChatInput!) {
          createChat(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          sender_id: userId1,
          receiver_id: userId2,
          message: "Test message for authorization test",
          room_id: newRoomId,
        },
      },
    };

    const chatResponse = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(createChatMutation2);

    const newChatId = chatResponse.body.data.createChat._id;

    // Now try to update this chat as user2
    const updateChatMutation = {
      query: `
        mutation UpdateChat($id: ID!, $input: UpdateChatInput!) {
          updateChat(id: $id, input: $input) {
            _id
            message
          }
        }
      `,
      variables: {
        id: newChatId,
        input: {
          message: "This should fail because I'm not the sender",
        },
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token2}`)
      .send(updateChatMutation);

    // Check if the response contains an authorization error
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("Not authorized");

    // Clean up
    const deleteChatMutation = {
      query: `
        mutation DeleteChat($id: ID!) {
          deleteChat(id: $id)
        }
      `,
      variables: {
        id: newChatId,
      },
    };

    await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteChatMutation);

    const deleteRoomMutation = {
      query: `
        mutation DeleteRoom($id: ID!) {
          deleteRoom(id: $id)
        }
      `,
      variables: {
        id: newRoomId,
      },
    };

    await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteRoomMutation);
  });

  // Test deleting a room as a different user (should fail)
  it("should fail to delete a room as a different user", async () => {
    // Create a new room as user1
    const createRoomMutation = {
      query: `
        mutation CreateRoom($input: CreateRoomInput!) {
          createRoom(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          user_id: userId1,
        },
      },
    };

    const roomResponse = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRoomMutation);

    const newRoomId = roomResponse.body.data.createRoom._id;

    // Now try to delete this room as user2
    const deleteRoomMutation = {
      query: `
        mutation DeleteRoom($id: ID!) {
          deleteRoom(id: $id)
        }
      `,
      variables: {
        id: newRoomId,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token2}`)
      .send(deleteRoomMutation);

    // Check if the response contains an authorization error
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("Not authorized");

    // Clean up
    await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteRoomMutation);
  });

  // Test creating a chat with invalid data (should fail)
  it("should fail to create a chat with invalid data", async () => {
    // Create a room first
    const createRoomMutation = {
      query: `
        mutation CreateRoom($input: CreateRoomInput!) {
          createRoom(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          user_id: userId1,
        },
      },
    };

    const roomResponse = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRoomMutation);

    const newRoomId = roomResponse.body.data.createRoom._id;

    // Try to create a chat with missing required fields
    const createChatMutation = {
      query: `
        mutation CreateChat($input: CreateChatInput!) {
          createChat(input: $input) {
            _id
          }
        }
      `,
      variables: {
        input: {
          sender_id: userId1,
          // Missing receiver_id
          message: "Test message with invalid data",
          room_id: newRoomId,
        },
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(createChatMutation);

    // Check if the response contains a validation error
    expect(response.body.errors).toBeDefined();

    // Clean up
    const deleteRoomMutation = {
      query: `
        mutation DeleteRoom($id: ID!) {
          deleteRoom(id: $id)
        }
      `,
      variables: {
        id: newRoomId,
      },
    };

    await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteRoomMutation);
  });

  // Test finding a non-existent room (should fail)
  it("should fail to find a non-existent room", async () => {
    // Generate a valid but non-existent ObjectId
    const nonExistentId = "507f1f77bcf86cd799439011"; // Valid ObjectId format that doesn't exist

    const findRoomByIdQuery = {
      query: `
        query FindRoomById($id: ID!) {
          findRoomById(id: $id) {
            _id
          }
        }
      `,
      variables: {
        id: nonExistentId,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(findRoomByIdQuery);

    // Check if the response contains a not found error
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("not found");
  });

  // Test finding a non-existent chat (should fail)
  it("should fail to find a non-existent chat", async () => {
    // Generate a valid but non-existent ObjectId
    const nonExistentId = "507f1f77bcf86cd799439012"; // Valid ObjectId format that doesn't exist

    const findChatByIdQuery = {
      query: `
      query FindChatById($id: ID!) {
        findChatById(id: $id) {
          _id
        }
      }
    `,
      variables: {
        id: nonExistentId,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(findChatByIdQuery);

    // Check if the response contains a not found error
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("not found");
  });

  // Test deleting a non-existent chat (should fail)
  it("should fail to delete a non-existent chat", async () => {
    // Generate a valid but non-existent ObjectId
    const nonExistentId = "507f1f77bcf86cd799439013"; // Valid ObjectId format that doesn't exist

    const deleteChatMutation = {
      query: `
      mutation DeleteChat($id: ID!) {
        deleteChat(id: $id)
      }
    `,
      variables: {
        id: nonExistentId,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteChatMutation);

    // Check if the response contains a not found error
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("not found");
  });

  // Test deleting a non-existent room (should fail)
  it("should fail to delete a non-existent room", async () => {
    // Generate a valid but non-existent ObjectId
    const nonExistentId = "507f1f77bcf86cd799439014"; // Valid ObjectId format that doesn't exist

    const deleteRoomMutation = {
      query: `
      mutation DeleteRoom($id: ID!) {
        deleteRoom(id: $id)
      }
    `,
      variables: {
        id: nonExistentId,
      },
    };

    const response = await request(url)
      .post("/")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteRoomMutation);

    // Check if the response contains a not found error
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("not found");
  });
});
