import User from "../models/user.js";
import { requireAuth } from "../utils/auth.js";

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

  input UpdateUserInput {
    name: String
    phone_number: String
    address: String
  }

  input UpdatePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  type Query {
    findAllUsers: [User]
    findUserById(id: ID!): User
    me: User
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload
    login(input: LoginInput!): AuthPayload
    updateUser(input: UpdateUserInput!): User
    updatePassword(input: UpdatePasswordInput!): User
    deleteUser(id: ID!): String
  }
`;

export const resolvers = {
  Query: {
    findAllUsers: requireAuth(async () => await User.findAll()),
    findUserById: requireAuth(async (_, { id }) => {
      const user = await User.findUserById(id);
      if (!user) throw new Error(`User with ID ${id} not found`);
      return user;
    }),
    me: requireAuth(async (_, __, { user }) => {
      return user;
    }),
  },
  Mutation: {
    register: async (_, { input }) => await User.register(input),
    login: async (_, { input }) => await User.login(input),
    updateUser: requireAuth(async (_, { input }, { user }) => {
      return await User.updateUser(user._id, input);
    }),
    updatePassword: requireAuth(async (_, { input }, { user }) => {
      return await User.updatePassword(
        user._id,
        input.currentPassword,
        input.newPassword
      );
    }),
    deleteUser: requireAuth(async (_, { id }, { user }) => {
      //TODO gaperlu sih sebetulnya, tp kalau usernya itu bisa delete
      if (user._id.toString() !== id) {
        throw new Error("Not authorized to delete other users");
      }
      await User.deleteUser(id);
      return `User with ID ${id} has been deleted`;
    }),
  },
};
