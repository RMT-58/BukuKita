import Rental from "../models/rental.js";
import RentalDetail from "../models/rentalDetail.js";
import { requireAuth } from "../utils/auth.js";

export const typeDefs = `#graphql
  enum RentalStatus {
    pending
    completed
    failed
  }

  type Rental {
    _id: ID!
    user_id: String!
    total_amount: Int!
    status: RentalStatus!
    payment_method: String
    paid_date: String
    created_at: String!
    updated_at: String!
    details: [RentalDetail]
  }

  type RentalDetail {
    _id: ID!
    book_id: ID!
    price: Int!
    period: Int!
    total: Int!
    title: String!
    author: String!
    genres: [String]
    synopsis: String
    cover_type: String!
    thumbnail_url: String
    image_urls: [String]
    rental_id: ID!
    rental_start: String!
    rental_end: String!
    created_at: String!
    updated_at: String!
  }

  input CreateRentalInput {
    user_id: String!
    total_amount: Int!
    payment_method: String
  }

  input UpdateRentalStatusInput {
    status: RentalStatus!
    payment_method: String
  }

  input CreateRentalDetailInput {
    book_id: String!
    price: Int!
    period: Int!
    title: String!
    author: String!
    genres: [String]
    synopsis: String
    cover_type: String!
    thumbnail_url: String
    image_urls: [String]
    rental_id: String!
    rental_start: String
    rental_end: String
  }

  input UpdateRentalDetailInput {
    price: Int
    period: Int
    rental_start: String
    rental_end: String
  }

  type Query {
    findAllRentals: [Rental]
    findRentalById(id: ID!): Rental
    findRentalsByUserId(userId: String!): [Rental]
    findRentalDetail(id: ID!): RentalDetail
    findRentalDetailsByRentalId(rentalId: String!): [RentalDetail]
    findActiveRentalsByBookId(bookId: String!): [RentalDetail]
    myRentals: [Rental]
  }

  type Mutation {
    createRental(input: CreateRentalInput!): Rental
    updateRentalStatus(id: ID!, input: UpdateRentalStatusInput!): Rental
    deleteRental(id: ID!): String
    
    createRentalDetail(input: CreateRentalDetailInput!): RentalDetail
    updateRentalDetail(id: ID!, input: UpdateRentalDetailInput!): RentalDetail
    deleteRentalDetail(id: ID!): String
  }
`;

export const resolvers = {
  Query: {
    findAllRentals: requireAuth(async () => await Rental.findAll()),
    findRentalById: requireAuth(async (_, { id }) => {
      const rental = await Rental.findRentalById(id);
      if (!rental) throw new Error(`Rental with ID ${id} not found`);
      return rental;
    }),
    findRentalsByUserId: requireAuth(async (_, { userId }) => {
      return await Rental.findRentalsByUserId(userId);
    }),
    findRentalDetail: requireAuth(async (_, { id }) => {
      const detail = await RentalDetail.findDetailById(id);
      if (!detail) throw new Error(`Rental detail with ID ${id} not found`);
      return detail;
    }),
    findRentalDetailsByRentalId: requireAuth(async (_, { rentalId }) => {
      return await RentalDetail.findDetailsByRentalId(rentalId);
    }),
    findActiveRentalsByBookId: requireAuth(async (_, { bookId }) => {
      return await RentalDetail.findActiveRentalsByBookId(bookId);
    }),
    myRentals: requireAuth(async (_, __, { user }) => {
      return await Rental.findRentalsByUserId(user._id.toString());
    }),
  },
  Mutation: {
    createRental: requireAuth(async (_, { input }, { user }) => {
      //rental harus dari authuser
      if (input.user_id !== user._id.toString()) {
        throw new Error("Not authorized to create rentals for other users");
      }

      return await Rental.createRental(input);
    }),
    updateRentalStatus: requireAuth(async (_, { id, input }, { user }) => {
      //cek usernya yg punya rentalnya bukan
      const rental = await Rental.findRentalById(id);
      if (!rental) throw new Error(`Rental with ID ${id} not found`);

      if (rental.user_id !== user._id.toString()) {
        throw new Error("Not authorized to update this rental");
      }

      return await Rental.updateRentalStatus(
        id,
        input.status,
        input.payment_method
      );
    }),
    deleteRental: requireAuth(async (_, { id }, { user }) => {
      //cek usernya yg punya rentalnya bukan
      const rental = await Rental.findRentalById(id);
      if (!rental) throw new Error(`Rental with ID ${id} not found`);

      if (rental.user_id !== user._id.toString()) {
        throw new Error("Not authorized to delete this rental");
      }

      await Rental.deleteRental(id);
      return `Rental with ID ${id} has been deleted`;
    }),
    createRentalDetail: requireAuth(async (_, { input }, { user }) => {
      //cek usernya yg punya rentalnya bukan
      const rental = await Rental.findRentalById(input.rental_id);
      if (!rental)
        throw new Error(`Rental with ID ${input.rental_id} not found`);

      if (rental.user_id !== user._id.toString()) {
        throw new Error("Not authorized to add details to this rental");
      }

      return await RentalDetail.createRentalDetail(input);
    }),
    updateRentalDetail: requireAuth(async (_, { id, input }, { user }) => {
      //cek usernya yg punya rental detailnyuaa bukan
      const detail = await RentalDetail.findDetailById(id);
      if (!detail) throw new Error(`Rental detail with ID ${id} not found`);

      const rental = await Rental.findRentalById(detail.rental_id);
      if (!rental)
        throw new Error(`Rental with ID ${detail.rental_id} not found`);

      if (rental.user_id !== user._id.toString()) {
        throw new Error("Not authorized to update this rental detail");
      }

      return await RentalDetail.updateRentalDetail(id, input);
    }),
    deleteRentalDetail: requireAuth(async (_, { id }, { user }) => {
      const detail = await RentalDetail.findDetailById(id);
      if (!detail) throw new Error(`Rental detail with ID ${id} not found`);

      const rental = await Rental.findRentalById(detail.rental_id);
      if (!rental)
        throw new Error(`Rental with ID ${detail.rental_id} not found`);

      if (rental.user_id !== user._id.toString()) {
        throw new Error("Not authorized to delete this rental detail");
      }

      await RentalDetail.deleteRentalDetail(id);
      return `Rental detail with ID ${id} has been deleted`;
    }),
  },
  Rental: {
    details: async (parent) => {
      const rentalIdString = parent._id.toString();
      return await RentalDetail.findDetailsByRentalId(rentalIdString);
    },
  },
};
