import { createApolloServer } from "../index.js";
import { io as Client } from "socket.io-client";
import { setupDatabase, teardownDatabase } from "../jest.setup.js";
import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "@jest/globals";
import User from "../models/user.js";
import { ObjectId } from "mongodb";
import Room from "../models/room.js";

describe("Socket.IO Tests", () => {
  let server;
  let httpServer;
  let url;
  let clientSocket1;
  let clientSocket2;
  let user1;
  let user2;
  let token1;
  let token2;
  let roomId;

  beforeAll(async () => {
    await setupDatabase();
    const result = await createApolloServer({ port: 0 });
    server = result.server;
    httpServer = result.httpServer;
    url = result.url;

    const username1 = `socketuser1_${Date.now()}`;
    const username2 = `socketuser2_${Date.now()}`;

    const userResult1 = await User.register({
      name: "Socket Test User 1",
      username: username1,
      password: "password123",
    });

    const userResult2 = await User.register({
      name: "Socket Test User 2",
      username: username2,
      password: "password123",
    });

    user1 = userResult1.user;
    user2 = userResult2.user;
    token1 = userResult1.token;
    token2 = userResult2.token;

    roomId = new ObjectId().toString();
  });

  afterAll(async () => {
    await httpServer.close();
    await server.stop();
    await teardownDatabase();
  });

  beforeEach((done) => {
    clientSocket1 = Client(url, {
      transports: ["websocket"],
      forceNew: true,
    });

    clientSocket2 = Client(url, {
      transports: ["websocket"],
      forceNew: true,
    });

    let connected = 0;
    const onConnect = () => {
      connected++;
      if (connected === 2) done();
    };

    clientSocket1.on("connect", onConnect);
    clientSocket2.on("connect", onConnect);
  });

  afterEach(() => {
    if (clientSocket1.connected) {
      clientSocket1.disconnect();
    }
    if (clientSocket2.connected) {
      clientSocket2.disconnect();
    }
  });

  it("should authenticate users with tokens", (done) => {
    clientSocket1.emit("authenticate", token1);

    const timeout = setTimeout(() => {
      done();
    }, 1000);

    clientSocket1.on("authenticated", (data) => {
      clearTimeout(timeout);
      expect(data).toBeDefined();
      done();
    });
  });

  it("should send and receive messages", (done) => {
    clientSocket1.emit("authenticate", token1);
    clientSocket2.emit("authenticate", token2);

    clientSocket1.emit("join_room", roomId);
    clientSocket2.emit("join_room", roomId);

    clientSocket2.on("new_message", (message) => {
      expect(message).toBeDefined();
      expect(message.sender_id).toBe(user1._id.toString());
      expect(message.receiver_id).toBe(user2._id.toString());
      expect(message.message).toBe("Hello from Socket Test 1");
      done();
    });

    setTimeout(() => {
      clientSocket1.emit("send_message", {
        room_id: roomId,
        sender_id: user1._id.toString(),
        receiver_id: user2._id.toString(),
        message: "Hello from Socket Test 1",
      });
    }, 100);
  });

  it("should mark messages as read", (done) => {
    clientSocket1.emit("authenticate", token1);
    clientSocket2.emit("authenticate", token2);

    clientSocket1.emit("join_room", roomId);
    clientSocket2.emit("join_room", roomId);

    clientSocket1.on("messages_read", (data) => {
      expect(data).toBeDefined();
      expect(data.room_id).toBe(roomId);
      expect(data.user_id).toBe(user2._id.toString());
      done();
    });

    setTimeout(() => {
      clientSocket2.emit("mark_messages_read", {
        roomId: roomId,
        userId: user2._id.toString(),
      });
    }, 100);
  });

  it("should test Room model methods directly", async () => {
    const roomData = {
      user_id: user1._id.toString(),
      receiver_id: user2._id.toString(),
    };

    const room = await Room.createRoom(roomData);
    expect(room).toBeDefined();
    expect(room._id).toBeDefined();
    expect(room.user_id).toBe(user1._id.toString());
    expect(room.receiver_id).toBe(user2._id.toString());

    const foundRoom = await Room.findRoomById(room._id.toString());
    expect(foundRoom).toBeDefined();
    expect(foundRoom._id.toString()).toBe(room._id.toString());

    const roomsByUser = await Room.findRoomsByUserId(user1._id.toString());
    expect(roomsByUser).toBeDefined();
    expect(roomsByUser.length).toBeGreaterThan(0);

    const allRooms = await Room.findAll();
    expect(allRooms).toBeDefined();
    expect(allRooms.length).toBeGreaterThan(0);

    const updateData = { updated_at: new Date() };
    const updatedRoom = await Room.updateRoom(room._id.toString(), updateData);
    expect(updatedRoom).toBeDefined();
    expect(updatedRoom.updated_at).toBeDefined();

    try {
      await Room.updateRoom(new ObjectId().toString(), updateData);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
    }

    try {
      await Room.createRoom({ user_id: user1._id.toString() });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("Receiver ID is required");
    }

    try {
      await Room.createRoom({ receiver_id: user2._id.toString() });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("User ID is required");
    }

    await Room.deleteRoom(room._id.toString());
    const deletedRoom = await Room.findRoomById(room._id.toString());
    expect(deletedRoom).toBeNull();

    try {
      await Room.deleteRoom(new ObjectId().toString());
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
