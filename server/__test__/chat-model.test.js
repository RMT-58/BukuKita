import { ObjectId } from "mongodb";
import Chat from "../models/chat.js";
import Room from "../models/room.js";
import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import { getDb } from "../config/mongodb.js";

describe("Chat & Room Model Tests", () => {
  let db;
  let userId;
  let receiverId;
  let roomId;
  let chatId;
  let senderId;

  beforeAll(async () => {
    await setupDatabase();
    db = getDb();

    // Create test IDs
    userId = new ObjectId().toString();
    receiverId = new ObjectId().toString();
    senderId = new ObjectId().toString();
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  // ROOM MODEL TESTS
  describe("Room Model", () => {
    it("should create a room", async () => {
      const roomData = {
        user_id: userId,
        receiver_id: receiverId,
      };

      const room = await Room.createRoom(roomData);
      expect(room).toBeDefined();
      expect(room._id).toBeDefined();
      expect(room.user_id).toBe(userId);
      expect(room.receiver_id).toBe(receiverId);
      expect(room.created_at).toBeDefined();
      expect(room.updated_at).toBeDefined();

      roomId = room._id.toString();
    });

    it("should find a room by ID", async () => {
      const room = await Room.findRoomById(roomId);
      expect(room).toBeDefined();
      expect(room._id.toString()).toBe(roomId);
      expect(room.user_id).toBe(userId);
      expect(room.receiver_id).toBe(receiverId);
    });

    it("should find rooms by user ID", async () => {
      const rooms = await Room.findRoomsByUserId(userId);
      expect(rooms).toBeDefined();
      expect(rooms.length).toBeGreaterThan(0);

      const foundRoom = rooms.find((r) => r._id.toString() === roomId);
      expect(foundRoom).toBeDefined();
      expect(foundRoom.user_id).toBe(userId);
    });

    it("should find all rooms", async () => {
      const rooms = await Room.findAll();
      expect(rooms).toBeDefined();
      expect(rooms.length).toBeGreaterThan(0);

      const foundRoom = rooms.find((r) => r._id.toString() === roomId);
      expect(foundRoom).toBeDefined();
    });

    it("should update a room", async () => {
      const updateData = {
        updated_at: new Date(),
      };

      const updatedRoom = await Room.updateRoom(roomId, updateData);
      expect(updatedRoom).toBeDefined();
      expect(updatedRoom._id.toString()).toBe(roomId);
      expect(updatedRoom.updated_at).toBeDefined();
    });

    it("should handle updating a non-existent room", async () => {
      const nonExistentId = new ObjectId().toString();
      const updateData = {
        updated_at: new Date(),
      };

      try {
        await Room.updateRoom(nonExistentId, updateData);
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should validate required fields when creating a room", async () => {
      // Test missing user_id
      try {
        await Room.createRoom({
          receiver_id: receiverId,
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("User ID is required");
      }

      // Test missing receiver_id
      try {
        await Room.createRoom({
          user_id: userId,
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Receiver ID is required");
      }
    });

    it("should delete a room", async () => {
      // Create a room to delete
      const roomData = {
        user_id: userId,
        receiver_id: receiverId,
      };

      const room = await Room.createRoom(roomData);
      const roomIdToDelete = room._id.toString();

      // Delete the room
      await Room.deleteRoom(roomIdToDelete);

      // Try to find the deleted room
      const deletedRoom = await Room.findRoomById(roomIdToDelete);
      expect(deletedRoom).toBeNull();
    });

    it("should handle deleting a non-existent room", async () => {
      const nonExistentId = new ObjectId().toString();

      try {
        await Room.deleteRoom(nonExistentId);
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // CHAT MODEL TESTS
  describe("Chat Model", () => {
    it("should create a chat", async () => {
      const chatData = {
        sender_id: senderId,
        receiver_id: receiverId,
        message: "Test message",
        room_id: roomId,
      };

      const chat = await Chat.createChat(chatData);
      expect(chat).toBeDefined();
      expect(chat._id).toBeDefined();
      expect(chat.sender_id).toBe(senderId);
      expect(chat.receiver_id).toBe(receiverId);
      expect(chat.message).toBe("Test message");
      expect(chat.room_id).toBe(roomId);
      expect(chat.read).toBe(false);

      chatId = chat._id.toString();
    });

    it("should find a chat by ID", async () => {
      const chat = await Chat.findChatById(chatId);
      expect(chat).toBeDefined();
      expect(chat._id.toString()).toBe(chatId);
      expect(chat.sender_id).toBe(senderId);
      expect(chat.message).toBe("Test message");
    });

    it("should find chats by room ID", async () => {
      const chats = await Chat.findChatsByRoomId(roomId);
      expect(chats).toBeDefined();
      expect(chats.length).toBeGreaterThan(0);
      expect(chats[0].room_id).toBe(roomId);
    });

    it("should find chats between users", async () => {
      const chats = await Chat.findChatsBetweenUsers(senderId, receiverId);
      expect(chats).toBeDefined();
      expect(chats.length).toBeGreaterThan(0);
      expect(chats[0].sender_id).toBe(senderId);
      expect(chats[0].receiver_id).toBe(receiverId);
    });

    it("should find all chats", async () => {
      const chats = await Chat.findAll();
      expect(chats).toBeDefined();
      expect(chats.length).toBeGreaterThan(0);
    });

    it("should update a chat", async () => {
      const updateData = {
        message: "Updated message",
        read: true,
      };

      const updatedChat = await Chat.updateChat(chatId, updateData);
      expect(updatedChat).toBeDefined();
      expect(updatedChat.message).toBe("Updated message");
      expect(updatedChat.read).toBe(true);
    });

    it("should mark messages as read", async () => {
      // Create another unread message
      await Chat.createChat({
        sender_id: senderId,
        receiver_id: receiverId,
        message: "Another test message",
        room_id: roomId,
      });

      const result = await Chat.markAsRead(roomId, receiverId);
      expect(result).toBe(true);

      // Verify messages are marked as read
      const chats = await Chat.findChatsByRoomId(roomId);
      const unreadChats = chats.filter(
        (chat) => !chat.read && chat.receiver_id === receiverId
      );
      expect(unreadChats.length).toBe(0);
    });

    it("should count unread messages", async () => {
      // Create an unread message
      await Chat.createChat({
        sender_id: senderId,
        receiver_id: receiverId,
        message: "Unread test message",
        room_id: roomId,
      });

      const count = await Chat.countUnreadMessages(roomId, receiverId);
      expect(count).toBeGreaterThan(0);
    });

    it("should delete a chat", async () => {
      await Chat.deleteChat(chatId);
      const deletedChat = await Chat.findChatById(chatId);
      expect(deletedChat).toBeNull();
    });

    it("should validate required fields", async () => {
      // Test missing sender_id
      try {
        await Chat.createChat({
          receiver_id: receiverId,
          message: "Test message",
          room_id: roomId,
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Sender ID is required");
      }

      // Test missing receiver_id
      try {
        await Chat.createChat({
          sender_id: senderId,
          message: "Test message",
          room_id: roomId,
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Receiver ID is required");
      }

      // Test missing message
      try {
        await Chat.createChat({
          sender_id: senderId,
          receiver_id: receiverId,
          room_id: roomId,
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Message is required");
      }

      // Test missing room_id
      try {
        await Chat.createChat({
          sender_id: senderId,
          receiver_id: receiverId,
          message: "Test message",
        });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toContain("Room ID is required");
      }
    });

    it("should handle updating a non-existent chat", async () => {
      const nonExistentId = new ObjectId().toString();
      try {
        await Chat.updateChat(nonExistentId, { message: "This should fail" });
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should handle deleting a non-existent chat", async () => {
      const nonExistentId = new ObjectId().toString();
      try {
        await Chat.deleteChat(nonExistentId);
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
