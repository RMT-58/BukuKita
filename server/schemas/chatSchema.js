import Chat from "../models/chat.js";
import Room from "../models/room.js";
import User from "../models/user.js";
import { requireAuth } from "../utils/auth.js";

export const typeDefs = `#graphql
  type Chat {
    _id: ID!
    sender_id: String!
    receiver_id: String!
    message: String!
    room_id: String!
    created_at: String!
    updated_at: String!
    sender: User
    receiver: User
  }

  type Room {
    _id: ID!
    user_id: String!
    created_at: String!
    updated_at: String!
    user: User
    chats: [Chat]
  }

  input CreateRoomInput {
    user_id: String!
  }

  input CreateChatInput {
    sender_id: String!
    receiver_id: String!
    message: String!
    room_id: String!
  }

  input UpdateChatInput {
    message: String
  }

  type Query {
    findAllRooms: [Room]
    findRoomById(id: ID!): Room
    findRoomsByUserId(userId: String!): [Room]
    
    findAllChats: [Chat]
    findChatById(id: ID!): Chat
    findChatsByRoomId(roomId: String!): [Chat]
    findChatsBetweenUsers(senderId: String!, receiverId: String!): [Chat]
    
    myRooms: [Room]
    myChats: [Chat]
  }

  type Mutation {
    createRoom(input: CreateRoomInput!): Room
    deleteRoom(id: ID!): String
    
    createChat(input: CreateChatInput!): Chat
    updateChat(id: ID!, input: UpdateChatInput!): Chat
    deleteChat(id: ID!): String
    
    sendMessage(receiverId: String!, message: String!): Chat
  }
`;

export const resolvers = {
  Query: {
    findAllRooms: requireAuth(async () => await Room.findAll()),
    findRoomById: requireAuth(async (_, { id }) => {
      const room = await Room.findRoomById(id);
      if (!room) throw new Error(`Room with ID ${id} not found`);
      return room;
    }),
    findRoomsByUserId: requireAuth(async (_, { userId }) => {
      return await Room.findRoomsByUserId(userId);
    }),

    findAllChats: requireAuth(async () => await Chat.findAll()),
    findChatById: requireAuth(async (_, { id }) => {
      const chat = await Chat.findChatById(id);
      if (!chat) throw new Error(`Chat with ID ${id} not found`);
      return chat;
    }),
    findChatsByRoomId: requireAuth(async (_, { roomId }) => {
      return await Chat.findChatsByRoomId(roomId);
    }),
    findChatsBetweenUsers: requireAuth(async (_, { senderId, receiverId }) => {
      return await Chat.findChatsBetweenUsers(senderId, receiverId);
    }),

    myRooms: requireAuth(async (_, __, { user }) => {
      return await Room.findRoomsByUserId(user._id.toString());
    }),
    myChats: requireAuth(async (_, __, { user }) => {
      //Find all chats dmn usernya sender/receiver
      const userId = user._id.toString();
      const chats = await Chat.getCollection()
        .find({
          $or: [{ sender_id: userId }, { receiver_id: userId }],
        })
        .sort({ created_at: -1 })
        .toArray();

      return chats;
    }),
  },
  Mutation: {
    createRoom: requireAuth(async (_, { input }) => {
      return await Room.createRoom(input);
    }),
    deleteRoom: requireAuth(async (_, { id }, { user }) => {
      //cek pemilik roomnya bukan
      const room = await Room.findRoomById(id);
      if (!room) throw new Error(`Room with ID ${id} not found`);

      if (room.user_id !== user._id.toString()) {
        throw new Error("Not authorized to delete this room");
      }

      await Room.deleteRoom(id);
      return `Room with ID ${id} has been deleted`;
    }),

    createChat: requireAuth(async (_, { input }, { user }) => {
      //cek sender nya authuser bukan
      if (input.sender_id !== user._id.toString()) {
        throw new Error("Not authorized to send messages as another user");
      }

      return await Chat.createChat(input);
    }),
    updateChat: requireAuth(async (_, { id, input }, { user }) => {
      //cek usernya pengirim chatnya bukan
      const chat = await Chat.findChatById(id);
      if (!chat) throw new Error(`Chat with ID ${id} not found`);

      if (chat.sender_id !== user._id.toString()) {
        throw new Error("Not authorized to update this message");
      }

      return await Chat.updateChat(id, input);
    }),
    deleteChat: requireAuth(async (_, { id }, { user }) => {
      //cek usernya pengirim chatnya bukan
      const chat = await Chat.findChatById(id);
      if (!chat) throw new Error(`Chat with ID ${id} not found`);

      if (chat.sender_id !== user._id.toString()) {
        throw new Error("Not authorized to delete this message");
      }

      await Chat.deleteChat(id);
      return `Chat with ID ${id} has been deleted`;
    }),

    sendMessage: requireAuth(async (_, { receiverId, message }, { user }) => {
      const senderId = user._id.toString();

      //find/create newroom
      let room = await Room.getCollection().findOne({
        $or: [
          { user_id: senderId, receiver_id: receiverId },
          { user_id: receiverId, receiver_id: senderId },
        ],
      });

      if (!room) {
        //create
        const roomResult = await Room.createRoom({
          user_id: senderId,
          receiver_id: receiverId,
        });
        room = roomResult;
      }

      //create chat
      const chatInput = {
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        room_id: room._id.toString(),
      };

      return await Chat.createChat(chatInput);
    }),
  },
  Room: {
    user: async (parent) => {
      return await User.findUserById(parent.user_id);
    },
    chats: async (parent) => {
      return await Chat.findChatsByRoomId(parent._id.toString());
    },
  },
  Chat: {
    sender: async (parent) => {
      return await User.findUserById(parent.sender_id);
    },
    receiver: async (parent) => {
      return await User.findUserById(parent.receiver_id);
    },
  },
};
