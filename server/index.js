// import dotenv from "dotenv";
// dotenv.config();

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
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

const server = new ApolloServer({
  typeDefs: [bookTypeDefs, userTypeDefs, rentalTypeDefs, chatTypeDefs],
  resolvers: [bookResolvers, userResolvers, rentalResolvers, chatResolvers],
  plugins: [errorLoggingPlugin],
  formatError: (error) => {
    console.error(error);
    if (error.extensions?.code === "INTERNAL_SERVER_ERROR") {
      return {
        message: "Internal server error",
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      };
    }
    return error;
  },
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    //GET  token dr the Authorization header
    const token = req.headers.authorization || "";

    //GET user dari token
    const user = await getUserFromToken(token);

    return { user };
  },
});

console.log(`🚀  Server ready at: ${url}`);
