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
import { fileURLToPath } from "url";
import {
  resolvers as imageResolvers,
  typeDefs as imageTypeDefs,
} from "./schemas/imageSchema.js";

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
      console.error(error);
      // Return the original error to preserve the message
      return error;
    },
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: options.port || 4000 },
    context: async ({ req }) => {
      //GET token from the Authorization header
      const token = req.headers.authorization || "";

      //GET user from token
      const user = await getUserFromToken(token);

      return { user };
    },
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  console.log(`🚀  Server ready at: ${url}`);

  return { server, url };
}

// Check if this file is being run directly
const currentFilePath = fileURLToPath(import.meta.url);
const isRunningDirectly = process.argv[1] === currentFilePath;

// Start the server if this file is run directly
if (isRunningDirectly) {
  createApolloServer();
}
