// // import { ApolloServer } from "@apollo/server";
// // import { startStandaloneServer } from "@apollo/server/standalone";
// // import {
// //   resolvers as bookResolvers,
// //   typeDefs as bookTypeDefs,
// // } from "./schemas/bookSchema.js";
// // import {
// //   resolvers as userResolvers,
// //   typeDefs as userTypeDefs,
// // } from "./schemas/userSchema.js";
// // import {
// //   resolvers as rentalResolvers,
// //   typeDefs as rentalTypeDefs,
// // } from "./schemas/rentalSchema.js";
// // import {
// //   resolvers as chatResolvers,
// //   typeDefs as chatTypeDefs,
// // } from "./schemas/chatSchema.js";
// // import { getUserFromToken } from "./utils/auth.js";

// // // Error logging middleware
// // const errorLoggingPlugin = {
// //   async requestDidStart() {
// //     return {
// //       async didEncounterErrors({ errors }) {
// //         console.error("GraphQL errors:", errors);
// //       },
// //     };
// //   },
// // };

// // export async function createApolloServer(options = {}) {
// //   const server = new ApolloServer({
// //     typeDefs: [bookTypeDefs, userTypeDefs, rentalTypeDefs, chatTypeDefs],
// //     resolvers: [bookResolvers, userResolvers, rentalResolvers, chatResolvers],
// //     plugins: [errorLoggingPlugin],
// //     formatError: (error) => {
// //       console.error(error);
// //       // Return the original error to preserve the message
// //       return error;
// //     },
// //   });

// //   const { url } = await startStandaloneServer(server, {
// //     listen: { port: options.port || 4000 },
// //     context: async ({ req }) => {
// //       //GET token from the Authorization header
// //       const token = req.headers.authorization || "";

// //       //GET user from token
// //       const user = await getUserFromToken(token);

// //       return { user };
// //     },
// //   });

// //   console.log(`🚀  Server ready at: ${url}`);

// //   return { server, url };
// // }

// // // Start the server if this file is run directly
// // if (import.meta.url === "file://" + process.argv[1]) {
// //   createApolloServer();
// // }

// import { ApolloServer } from "@apollo/server";
// import { startStandaloneServer } from "@apollo/server/standalone";
// import {
//   resolvers as bookResolvers,
//   typeDefs as bookTypeDefs,
// } from "./schemas/bookSchema.js";
// import {
//   resolvers as userResolvers,
//   typeDefs as userTypeDefs,
// } from "./schemas/userSchema.js";
// import {
//   resolvers as rentalResolvers,
//   typeDefs as rentalTypeDefs,
// } from "./schemas/rentalSchema.js";
// import {
//   resolvers as chatResolvers,
//   typeDefs as chatTypeDefs,
// } from "./schemas/chatSchema.js";
// import { getUserFromToken } from "./utils/auth.js";
// import { fileURLToPath } from "url";

// // Error logging middleware
// const errorLoggingPlugin = {
//   async requestDidStart() {
//     return {
//       async didEncounterErrors({ errors }) {
//         console.error("GraphQL errors:", errors);
//       },
//     };
//   },
// };

// export async function createApolloServer(options = {}) {
//   const server = new ApolloServer({
//     typeDefs: [bookTypeDefs, userTypeDefs, rentalTypeDefs, chatTypeDefs],
//     resolvers: [bookResolvers, userResolvers, rentalResolvers, chatResolvers],
//     plugins: [errorLoggingPlugin],
//     formatError: (error) => {
//       console.error(error);
//       // Return the original error to preserve the message
//       return error;
//     },
//   });

//   const { url } = await startStandaloneServer(server, {
//     listen: { port: options.port || 4000 },
//     context: async ({ req }) => {
//       //GET token from the Authorization header
//       const token = req.headers.authorization || "";

//       //GET user from token
//       const user = await getUserFromToken(token);

//       return { user };
//     },
//   });

//   console.log(`🚀  Server ready at: ${url}`);

//   return { server, url };
// }

// // Check if this file is being run directly
// const currentFilePath = fileURLToPath(import.meta.url);
// const isRunningDirectly = process.argv[1] === currentFilePath;

// // Start the server if this file is run directly
// if (isRunningDirectly) {
//   createApolloServer();
// }
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

// Error logging middleware
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
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Enable CORS for all routes
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs: [bookTypeDefs, userTypeDefs, rentalTypeDefs, chatTypeDefs],
    resolvers: [bookResolvers, userResolvers, rentalResolvers, chatResolvers],
    plugins: [
      errorLoggingPlugin,
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
    formatError: (error) => {
      console.error("GraphQL Error:", error);
      return error;
    },
  });

  // Start Apollo Server
  await server.start();

  // Set up middleware for the /graphql endpoint
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

  // Set up Socket.IO on the same server
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Authenticate user
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

    // Join a chat room
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Leave a chat room
    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Handle new message
    socket.on("send_message", async (messageData) => {
      try {
        const { room_id, sender_id, receiver_id, message } = messageData;

        // Save message to database
        const newChat = await Chat.createChat({
          room_id,
          sender_id,
          receiver_id,
          message,
        });

        // Get sender info
        const sender = await User.findUserById(sender_id);

        // Emit to room
        io.to(room_id).emit("new_message", {
          ...newChat,
          sender: {
            _id: sender._id,
            name: sender.name,
            username: sender.username,
          },
        });

        // Emit notification to receiver
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

    // Handle marking messages as read
    socket.on("mark_messages_read", async ({ roomId, userId }) => {
      try {
        await Chat.markAsRead(roomId, userId);

        // Notify room that messages have been read
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

  // Add a simple route for the root path
  app.get("/", (req, res) => {
    res.send("BukuKita API Server. Use /graphql for GraphQL endpoint.");
  });

  // Start the server
  const PORT = process.env.PORT || 4000;

  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));

  console.log(`🚀 Server ready at http://localhost:${PORT}/`);
  console.log(`📈 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`🔌 Socket.IO running on the same port`);

  return { server, httpServer };
}

// Check if this file is being run directly
const currentFilePath = fileURLToPath(import.meta.url);
const isRunningDirectly = process.argv[1] === currentFilePath;

// Start the server if this file is run directly
if (isRunningDirectly) {
  createApolloServer();
}
