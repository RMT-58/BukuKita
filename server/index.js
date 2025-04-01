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

const server = new ApolloServer({
  typeDefs: [bookTypeDefs, userTypeDefs],
  resolvers: [bookResolvers, userResolvers],
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
