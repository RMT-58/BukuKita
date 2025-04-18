import request from "supertest";
import { startTestServer, stopTestServer } from "../test-utils.js";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";
import { ObjectId } from "mongodb";

describe("Chat API Tests", () => {
  let url;
  let token1, token2;
  let userId1, userId2;
  let roomId;
  let chatId;
  let testUsername1, testUsername2;

  beforeAll(async () => {
    await setupDatabase();
    const { url: serverUrl } = await startTestServer();
    url = serverUrl;

    testUsername1 = `chatuser1_${Date.now()}`;
    testUsername2 = `chatuser2_${Date.now()}`;

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
          name: "Chat Test User 1",
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
          name: "Chat Test User 2",
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
  });

  afterAll(async () => {
    await stopTestServer();
    await teardownDatabase();
  });

  it("should create a new chat room when authenticated", async () => {
    const createRoomMutation = {
      query: `
        mutation CreateRoom($input: CreateRoomInput!) {
          createRoom(input: $input) {
            _id
            user_id
            receiver_id
          }
        }
      `,
      variables: {
        input: {
          user_id: userId1,
          receiver_id: userId2,
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRoomMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createRoom).toBeDefined();
    expect(response.body.data.createRoom.user_id).toBe(userId1);
    expect(response.body.data.createRoom.receiver_id).toBe(userId2);

    roomId = response.body.data.createRoom._id;
  });

  it("should find all rooms when authenticated", async () => {
    const findAllRoomsQuery = {
      query: `
        query {
          findAllRooms {
            _id
            user_id
            receiver_id
            created_at
            updated_at
          }
        }
      `,
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findAllRoomsQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findAllRooms).toBeDefined();
    expect(response.body.data.findAllRooms).toBeInstanceOf(Array);
    expect(response.body.data.findAllRooms.length).toBeGreaterThan(0);
  });

  it("should find a room by ID when authenticated", async () => {
    const findRoomByIdQuery = {
      query: `
        query FindRoomById($id: ID!) {
          findRoomById(id: $id) {
            _id
            user_id
            receiver_id
            created_at
            updated_at
          }
        }
      `,
      variables: {
        id: roomId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findRoomByIdQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRoomById).toBeDefined();
    expect(response.body.data.findRoomById._id).toBe(roomId);
    expect(response.body.data.findRoomById.user_id).toBe(userId1);
    expect(response.body.data.findRoomById.receiver_id).toBe(userId2);
  });

  it("should handle finding a non-existent room", async () => {
    const nonExistentId = new ObjectId().toString();

    const findRoomByIdQuery = {
      query: `
        query FindRoomById($id: ID!) {
          findRoomById(id: $id) {
            _id
            user_id
            receiver_id
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
      .send(findRoomByIdQuery);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("not found");
  });

  it("should find rooms by user ID when authenticated", async () => {
    const findRoomsByUserIdQuery = {
      query: `
        query FindRoomsByUserId($userId: String!) {
          findRoomsByUserId(userId: $userId) {
            _id
            user_id
            receiver_id
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
      .send(findRoomsByUserIdQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRoomsByUserId).toBeDefined();
    expect(response.body.data.findRoomsByUserId).toBeInstanceOf(Array);
    expect(response.body.data.findRoomsByUserId.length).toBeGreaterThan(0);
    expect(response.body.data.findRoomsByUserId[0].user_id).toBe(userId1);
  });

  it("should find rooms for the authenticated user", async () => {
    const myRoomsQuery = {
      query: `
        query {
          myRooms {
            _id
            user_id
            receiver_id
          }
        }
      `,
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(myRoomsQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.myRooms).toBeDefined();
    expect(response.body.data.myRooms).toBeInstanceOf(Array);
    expect(response.body.data.myRooms.length).toBeGreaterThan(0);

    const foundRoom = response.body.data.myRooms.find((r) => r._id === roomId);
    expect(foundRoom).toBeDefined();
    expect(foundRoom.user_id).toBe(userId1);
    expect(foundRoom.receiver_id).toBe(userId2);
  });

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
          }
        }
      `,
      variables: {
        receiverId: userId2,
        message: "Hello, this is a test message!",
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(sendMessageMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendMessage).toBeDefined();
    expect(response.body.data.sendMessage.sender_id).toBe(userId1);
    expect(response.body.data.sendMessage.receiver_id).toBe(userId2);
    expect(response.body.data.sendMessage.message).toBe(
      "Hello, this is a test message!"
    );

    chatId = response.body.data.sendMessage._id;
  });

  it("should find chats by room ID when authenticated", async () => {
    const findChatsByRoomIdQuery = {
      query: `
        query FindChatsByRoomId($roomId: String!) {
          findChatsByRoomId(roomId: $roomId) {
            _id
            sender_id
            receiver_id
            message
          }
        }
      `,
      variables: {
        roomId: roomId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findChatsByRoomIdQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findChatsByRoomId).toBeDefined();
    expect(response.body.data.findChatsByRoomId).toBeInstanceOf(Array);
    expect(response.body.data.findChatsByRoomId.length).toBeGreaterThan(0);
    expect(response.body.data.findChatsByRoomId[0].message).toBe(
      "Hello, this is a test message!"
    );
  });

  it("should find a chat by ID when authenticated", async () => {
    const findChatByIdQuery = {
      query: `
        query FindChatById($id: ID!) {
          findChatById(id: $id) {
            _id
            sender_id
            receiver_id
            message
            room_id
          }
        }
      `,
      variables: {
        id: chatId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findChatByIdQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findChatById).toBeDefined();
    expect(response.body.data.findChatById._id).toBe(chatId);
    expect(response.body.data.findChatById.sender_id).toBe(userId1);
    expect(response.body.data.findChatById.receiver_id).toBe(userId2);
    expect(response.body.data.findChatById.message).toBe(
      "Hello, this is a test message!"
    );
  });

  it("should handle finding a non-existent chat", async () => {
    const nonExistentId = new ObjectId().toString();

    const findChatByIdQuery = {
      query: `
        query FindChatById($id: ID!) {
          findChatById(id: $id) {
            _id
            sender_id
            receiver_id
            message
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
      .send(findChatByIdQuery);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("not found");
  });

  it("should mark messages as read when authenticated", async () => {
    const markMessagesAsReadMutation = {
      query: `
        mutation MarkMessagesAsRead($roomId: String!) {
          markMessagesAsRead(roomId: $roomId)
        }
      `,
      variables: {
        roomId: roomId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token2}`)
      .send(markMessagesAsReadMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.markMessagesAsRead).toBe(true);
  });

  it("should count unread messages when authenticated", async () => {
    const sendMessageMutation = {
      query: `
        mutation SendMessage($receiverId: String!, $message: String!) {
          sendMessage(receiverId: $receiverId, message: $message) {
            _id
          }
        }
      `,
      variables: {
        receiverId: userId2,
        message: "Another test message!",
      },
    };

    await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(sendMessageMutation);

    const countUnreadMessagesQuery = {
      query: `
        query CountUnreadMessages($roomId: String!) {
          countUnreadMessages(roomId: $roomId)
        }
      `,
      variables: {
        roomId: roomId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token2}`)
      .send(countUnreadMessagesQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.countUnreadMessages).toBeDefined();
    expect(response.body.data.countUnreadMessages).toBe(1);
  });

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
          }
        }
      `,
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findAllChatsQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findAllChats).toBeDefined();
    expect(response.body.data.findAllChats).toBeInstanceOf(Array);
    expect(response.body.data.findAllChats.length).toBeGreaterThan(0);
  });

  it("should find chats for the authenticated user", async () => {
    const myChatsQuery = {
      query: `
        query {
          myChats {
            _id
            sender_id
            receiver_id
            message
          }
        }
      `,
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(myChatsQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.myChats).toBeDefined();
    expect(response.body.data.myChats).toBeInstanceOf(Array);
    expect(response.body.data.myChats.length).toBeGreaterThan(0);
  });

  it("should create a chat directly when authenticated", async () => {
    const createChatMutation = {
      query: `
        mutation CreateChat($input: CreateChatInput!) {
          createChat(input: $input) {
            _id
            sender_id
            receiver_id
            message
            room_id
          }
        }
      `,
      variables: {
        input: {
          sender_id: userId1,
          receiver_id: userId2,
          message: "Test direct chat creation",
          room_id: roomId,
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createChatMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createChat).toBeDefined();
    expect(response.body.data.createChat.sender_id).toBe(userId1);
    expect(response.body.data.createChat.receiver_id).toBe(userId2);
    expect(response.body.data.createChat.message).toBe(
      "Test direct chat creation"
    );
    expect(response.body.data.createChat.room_id).toBe(roomId);

    chatId = response.body.data.createChat._id;
  });

  it("should update a chat when authenticated as the sender", async () => {
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
        id: chatId,
        input: {
          message: "Updated test message",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(updateChatMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateChat).toBeDefined();
    expect(response.body.data.updateChat.message).toBe("Updated test message");
  });

  it("should handle updating a non-existent chat", async () => {
    const nonExistentId = new ObjectId().toString();

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
        id: nonExistentId,
        input: {
          message: "Updated message",
        },
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(updateChatMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("not found");
  });

  it("should find chats between users when authenticated", async () => {
    const findChatsBetweenUsersQuery = {
      query: `
        query FindChatsBetweenUsers($senderId: String!, $receiverId: String!) {
          findChatsBetweenUsers(senderId: $senderId, receiverId: $receiverId) {
            _id
            sender_id
            receiver_id
            message
          }
        }
      `,
      variables: {
        senderId: userId1,
        receiverId: userId2,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findChatsBetweenUsersQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findChatsBetweenUsers).toBeDefined();
    expect(response.body.data.findChatsBetweenUsers).toBeInstanceOf(Array);
    expect(response.body.data.findChatsBetweenUsers.length).toBeGreaterThan(0);
  });

  it("should create a room when sending a message if room doesn't exist", async () => {
    const receiverUsername = `receiveruser_${Date.now()}`;
    const registerReceiverMutation = {
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
          name: "Receiver User",
          username: receiverUsername,
          password: "password123",
        },
      },
    };

    const receiverResponse = await request(url)
      .post("/graphql")
      .send(registerReceiverMutation);
    const newReceiverId = receiverResponse.body.data.register.user._id;

    const sendMessageMutation = {
      query: `
        mutation SendMessage($receiverId: String!, $message: String!) {
          sendMessage(receiverId: $receiverId, message: $message) {
            _id
            sender_id
            receiver_id
            message
            room_id
          }
        }
      `,
      variables: {
        receiverId: newReceiverId,
        message: "Test message with room creation",
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(sendMessageMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendMessage).toBeDefined();
    expect(response.body.data.sendMessage.message).toBe(
      "Test message with room creation"
    );
    expect(response.body.data.sendMessage.sender_id).toBe(userId1);
    expect(response.body.data.sendMessage.receiver_id).toBe(newReceiverId);
    expect(response.body.data.sendMessage.room_id).toBeDefined();
  });

  it("should delete a chat when authenticated as the sender", async () => {
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
          receiver_id: userId2,
          message: "Chat to be deleted",
          room_id: roomId,
        },
      },
    };

    const createResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createChatMutation);

    const chatIdToDelete = createResponse.body.data.createChat._id;

    const deleteChatMutation = {
      query: `
        mutation DeleteChat($id: ID!) {
          deleteChat(id: $id)
        }
      `,
      variables: {
        id: chatIdToDelete,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteChatMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteChat).toBeDefined();
    expect(response.body.data.deleteChat).toContain("has been deleted");
  });

  it("should handle deleting a non-existent chat", async () => {
    const nonExistentId = new ObjectId().toString();

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
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteChatMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("not found");
  });

  it("should delete a room when authenticated as the owner", async () => {
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
          receiver_id: userId2,
        },
      },
    };

    const roomResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRoomMutation);

    const roomIdToDelete = roomResponse.body.data.createRoom._id;

    const deleteRoomMutation = {
      query: `
        mutation DeleteRoom($id: ID!) {
          deleteRoom(id: $id)
        }
      `,
      variables: {
        id: roomIdToDelete,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(deleteRoomMutation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteRoom).toBeDefined();
    expect(response.body.data.deleteRoom).toContain("has been deleted");
  });

  it("should fail to create a chat as another user", async () => {
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
          sender_id: userId2,
          receiver_id: userId1,
          message: "This should fail",
          room_id: roomId,
        },
      },
    };

    const createResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createChatMutation);

    expect(createResponse.body.errors).toBeDefined();
    expect(createResponse.body.errors[0].message).toContain("Not authorized");
  });

  it("should fail to update a chat when not authenticated as the sender", async () => {
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
          receiver_id: userId2,
          message: "Chat for error testing",
          room_id: roomId,
        },
      },
    };

    const validCreateResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createChatMutation);

    const chatId = validCreateResponse.body.data.createChat._id;

    const updateChatMutation = {
      query: `
        mutation UpdateChat($id: ID!, $input: UpdateChatInput!) {
          updateChat(id: $id, input: $input) {
            _id
          }
        }
      `,
      variables: {
        id: chatId,
        input: {
          message: "This update should fail",
        },
      },
    };

    const updateResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token2}`)
      .send(updateChatMutation);

    expect(updateResponse.body.errors).toBeDefined();
    expect(updateResponse.body.errors[0].message).toContain("Not authorized");
  });

  it("should fail to delete a chat when not authenticated as the sender", async () => {
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
          receiver_id: userId2,
          message: "Chat for delete test",
          room_id: roomId,
        },
      },
    };

    const createResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createChatMutation);

    const chatIdToDelete = createResponse.body.data.createChat._id;

    const deleteChatMutation = {
      query: `
        mutation DeleteChat($id: ID!) {
          deleteChat(id: $id)
        }
      `,
      variables: {
        id: chatIdToDelete,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token2}`)
      .send(deleteChatMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("Not authorized");
  });

  it("should fail to delete a room when not authenticated as the owner", async () => {
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
          receiver_id: userId2,
        },
      },
    };

    const roomResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRoomMutation);

    const newRoomId = roomResponse.body.data.createRoom._id;

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
      .post("/graphql")
      .set("Authorization", `Bearer ${token2}`)
      .send(deleteRoomMutation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain("Not authorized");
  });

  it("should resolve Room type fields", async () => {
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
          receiver_id: userId2,
        },
      },
    };

    const createRoomResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(createRoomMutation);

    const newRoomId = createRoomResponse.body.data.createRoom._id;

    const findRoomByIdQuery = {
      query: `
        query FindRoomById($id: ID!) {
          findRoomById(id: $id) {
            _id
            user_id
            receiver_id
            user {
              _id
              name
              username
            }
            receiver {
              _id
              name
              username
            }
            chats {
              _id
              message
            }
            unreadCount
          }
        }
      `,
      variables: {
        id: newRoomId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findRoomByIdQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findRoomById).toBeDefined();
    expect(response.body.data.findRoomById.user).toBeDefined();
    expect(response.body.data.findRoomById.user._id).toBe(userId1);
    expect(response.body.data.findRoomById.receiver).toBeDefined();
    expect(response.body.data.findRoomById.chats).toBeDefined();
    expect(response.body.data.findRoomById.unreadCount).toBeDefined();
  });

  it("should resolve Chat type fields", async () => {
    const sendMessageMutation = {
      query: `
        mutation SendMessage($receiverId: String!, $message: String!) {
          sendMessage(receiverId: $receiverId, message: $message) {
            _id
          }
        }
      `,
      variables: {
        receiverId: userId2,
        message: "Test message for Chat type resolvers",
      },
    };

    const sendResponse = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(sendMessageMutation);

    const newChatId = sendResponse.body.data.sendMessage._id;

    const findChatByIdQuery = {
      query: `
        query FindChatById($id: ID!) {
          findChatById(id: $id) {
            _id
            sender_id
            receiver_id
            message
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
        id: newChatId,
      },
    };

    const response = await request(url)
      .post("/graphql")
      .set("Authorization", `Bearer ${token1}`)
      .send(findChatByIdQuery);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findChatById).toBeDefined();
    expect(response.body.data.findChatById.sender).toBeDefined();
    expect(response.body.data.findChatById.sender._id).toBe(userId1);
    expect(response.body.data.findChatById.receiver).toBeDefined();
    expect(response.body.data.findChatById.receiver._id).toBe(userId2);
  });
});
