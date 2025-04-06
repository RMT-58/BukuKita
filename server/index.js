import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import {
  resolvers as bookResolvers,
  typeDefs as bookTypeDefs,
} from "./schemas/bookSchema.js";
import {
  resolvers as userResolvers,
  typeDefs as userTypeDefs,
} from "./schemas/userSchema.js";
import {
  resolvers as rentalResolvers,
  typeDefs as rentalTypeDefs,
} from "./schemas/rentalSchema.js";
import {
  resolvers as chatResolvers,
  typeDefs as chatTypeDefs,
} from "./schemas/chatSchema.js";
import { getUserFromToken } from "./utils/auth.js";
import { fileURLToPath } from "url";
import Chat from "./models/chat.js";
import User from "./models/user.js";
import {
  resolvers as imageResolvers,
  typeDefs as imageTypeDefs,
} from "./schemas/imageSchema.js";

//error logging middleware
const errorLoggingPlugin = {
  async requestDidStart() {
    return {
      async didEncounterErrors({ errors }) {
        console.error("GraphQL errors:", errors);
      },
    };
  },
};

export async function createApolloServer(options = {}) {
  //bikinapp Express sama HTTP servernya
  const app = express();
  const httpServer = http.createServer(app);

  //CORS
  app.use(
    cors({
      origin: "*",
      // methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use("/graphql", express.json());

  //create apollo server
  const server = new ApolloServer({
    typeDefs: [
      bookTypeDefs,
      userTypeDefs,
      rentalTypeDefs,
      chatTypeDefs,
      imageTypeDefs,
    ],
    resolvers: [
      bookResolvers,
      userResolvers,
      rentalResolvers,
      chatResolvers,
      imageResolvers,
    ],
    plugins: [errorLoggingPlugin],

    formatError: (error) => {
      console.error("GraphQL Error:", error);
      return error;
    },
  });

  //start Apollo server
  await server.start();

  //setup middleware buatendpoint /graphql
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || "";
        const user = await getUserFromToken(token);
        return { user };
      },
    })
  );

  //set up socket di server yg sama aja
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      // methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

  //handle socket io connect
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    //AUTHENTICATE USER
    socket.on("authenticate", async (token) => {
      try {
        const user = await getUserFromToken(token);
        if (user) {
          socket.userId = user._id.toString();
          socket.join(`user:${user._id}`);
          console.log(`User ${user._id} authenticated`);
        }
      } catch (error) {
        console.error("Authentication error:", error);
      }
    });

    //join chatroom
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    //keluar chatroom
    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    //handle new message
    socket.on("send_message", async (messageData) => {
      try {
        const { room_id, sender_id, receiver_id, message } = messageData;

        //save message ke db
        const newChat = await Chat.createChat({
          room_id,
          sender_id,
          receiver_id,
          message,
        });

        //GET info sendernya
        const sender = await User.findUserById(sender_id);

        io.to(room_id).emit("new_message", {
          ...newChat,
          sender: {
            _id: sender._id,
            name: sender.name,
            username: sender.username,
          },
        });

        //buat notif
        io.to(`user:${receiver_id}`).emit("message_notification", {
          room_id,
          sender: {
            _id: sender._id,
            name: sender.name,
            username: sender.username,
          },
          message,
          created_at: newChat.created_at,
        });

        console.log(`Message sent to room ${room_id}`);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    //handle read message
    socket.on("mark_messages_read", async ({ roomId, userId }) => {
      try {
        await Chat.markAsRead(roomId, userId);

        //notify buat read messages
        io.to(roomId).emit("messages_read", {
          room_id: roomId,
          user_id: userId,
        });

        console.log(
          `Messages in room ${roomId} marked as read by user ${userId}`
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  //ROOT PATH
  app.get("/", (req, res) => {
    res.send("BukuKita API Server. Use /graphql for GraphQL endpoint.");
  });

  // !MULAI SERVER
  // const PORT = process.env.PORT || 4000;

  // await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));

  // console.log(`🚀 Server ready at http://localhost:${PORT}/`);
  // console.log(`📈 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  // console.log(`🔌 Socket.IO running on the same port`);

  // return { server, httpServer };

  const PORT = options.port || process.env.PORT || 4000;

  const serverInfo = await new Promise((resolve) => {
    const server = httpServer.listen({ port: PORT }, () => {
      const address = server.address();
      const url = `http://localhost:${address.port}`;
      resolve({ server, url });
    });
  });

  console.log(`🚀 Server ready at ${serverInfo.url}/`);
  console.log(`📈 GraphQL endpoint: ${serverInfo.url}/graphql`);
  console.log(`🔌 Socket.IO running on the same port`);

  return { server, httpServer, url: serverInfo.url };
}

//cek index running direct ga
const currentFilePath = fileURLToPath(import.meta.url);
const isRunningDirectly = process.argv[1] === currentFilePath;

//start servernya kalau iya
if (isRunningDirectly) {
  createApolloServer();
}
