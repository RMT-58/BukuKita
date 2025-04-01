import User from "../models/user.js";

export const typeDefs = `#graphql
  type User {
    _id: ID!
    name: String!
    username: String!
    phone_number: String
    address: String
    created_at: String
    updated_at: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    username: String!
    password: String!
    phone_number: String
    address: String
  }

  input LoginInput {
    username: String!
    password: String!
  }

  type Query {
    findAllUsers: [User]
    findUserById(id: ID!): User
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload
    login(input: LoginInput!): AuthPayload
    deleteUser(id: ID!): String
  }
`;

export const resolvers = {
  Query: {
    findAllUsers: async () => await User.findAll(),
    findUserById: async (_, { id }) => {
      const user = await User.findUserById(id);
      if (!user) throw new Error(`User with ID ${id} not found`);
      return user;
    },
  },
  Mutation: {
    register: async (_, { input }) => await User.register(input),
    login: async (_, { input }) => await User.login(input),
    deleteUser: async (_, { id }) => {
      await User.deleteUser(id);
      return `User with ID ${id} has been deleted`;
    },
  },
};
