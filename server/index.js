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
import Rental from "./models/rental.js";

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

  app.use(express.json());

  //masukin midtrans webhooknya didalam ENV BRADER
  // Modify the webhook handler in index.js to use the new method in rental.js
  app.post("/midtrans-webhook", async (req, res) => {
    try {
      // TODO MIDTRANS - Replace current webhook logic with rental model method
      const result = await Rental.handleMidtransWebhook(req.body);
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error("Midtrans webhook error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
  //   app.post("/midtrans-webhook", (req, res) => {
  //     console.log(req.body);
  //     res.status(200).send(req.body);
  //     //cek order ID exist in dDB or not
  //     //CEK statusnya udh completed atau masih pending
  //     //kalau pending kita go
  //     //cek gross amount di body midtrans sudah sesuai atau belum dengan amount di rental DB
  //     //transaction statusnys cek, capture atau settle, selain 2 itu, berarti GAGAL
  //     //GENERATE SIGNATURE KEY order_id + status_code + gross_amount + merchant_server_key (sha512)
  //     //cek signature key di body midtrans apakah sama dengan signature key yang kita generate
  //     //kalau aman update status menjadi CoMPLETED

  //     /*
  //     const { createHash } = require("node:crypto")

  // const key = createHash('sha512').update("xSyEfCe3g-oSiihhfW-iQ20050000.00SB-Mid-server-FzY1SoEp8z1crliIG5oXBKIy").digest('hex')

  // const sKey = "5df184ab6b46bf335412f55a7e1165ca8aa45c6d2dc2d7e8a0b9415efd027ad2598997ab41a29bf6e8610393ba79bfdec4f0a4f732226f5a490be9a1113ee5df"

  // if (key === sKey) {
  //   console.log("Horeee...")
  // }
  //     */
  //   });

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
