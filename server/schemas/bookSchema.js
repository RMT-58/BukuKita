// type Book {
//     id: Int!
//     title: String!
//     author: String!
//     genres: [String!]!
//     synopsis: String
//     cover_type: CoverType!
//     condition: Int!
//     condition_details: String
//     thumbnail_url: String
//     image_urls: [String!]!
//     status: BookStatus!
//     price: Int!
//     uploaded_by: User!
//     rental_details: [RentalDetail!]!
//     rental_payments: [Rental!]!
//     created_at: String!
//     updated_at: String!
//   }

import Book from "../models/book.js";
export const typeDefs = `#graphql
    
    enum CoverType {
      hardcover
      paperback
    }

    enum BookStatus {
      isClosed
      forRent
    }

      type Book {
      _id: ID!
      title: String!
      author: String!
      genres: [String!]!
      synopsis: String
      cover_type: CoverType!
      condition: Int!
      condition_details: String
      thumbnail_url: String
      image_urls: [String]
      status: BookStatus!
      price: Int!
      created_at: String!
      updated_at: String!
      }

      input AddBookInput {
      title: String!
      author: String!
      genres: [String!]!
      synopsis: String
      cover_type: CoverType!
      condition: Int!
      condition_details: String
      thumbnail_url: String
      image_urls: [String]
      status: BookStatus!
      price: Int!
      uploaded_by: Int!
      }

      input UpdateBookInput {
      title: String
      author: String
      genres: [String!]
      synopsis: String
      cover_type: CoverType
      condition: Int
      condition_details: String
      thumbnail_url: String
      image_urls: [String]
      status: BookStatus
      price: Int
      }

      type Query {
        findAll: [Book]
        findBookById(id: ID!): Book
      }

      type Mutation {
        addBook(input: AddBookInput!): Book!
        updateBook(id: ID!, input: UpdateBookInput!): Book
        deleteBook(id: ID!): String

      }
    `;

export const resolvers = {
  Query: {
    findAll: async function () {
      //   return books;
      const books = await Book.findAll();
      return books;
    },
    findBookById: async (_, { id }) => {
      const book = await Book.findBookById(id);
      if (!book) {
        throw new Error(`Book with ID ${id} not found`);
      }
      return book;
    },
  },
  Mutation: {
    addBook: async (_, { input }) => {
      //? bisa validasi disini

      const newBook = await Book.addBook({
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return {
        _id: newBook._id.toString(),
        ...newBook,
      };
    },
    updateBook: async (_, { id, input }) => {
      const updatedBook = await Book.updateBook(id, input);
      return {
        _id: updatedBook._id.toString(),
        ...updatedBook,
      };
    },
    deleteBook: async (_, { id }) => {
      await Book.deleteBook(id);
      return `Book with ID ${id} has been deleted`;
    },
  },
};
