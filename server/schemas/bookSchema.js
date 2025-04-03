import Book from "../models/book.js";
import { requireAuth } from "../utils/auth.js";

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
      uploaded_by: ID!
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

    input BookFilters {
      status: BookStatus
      minPrice: Int
      maxPrice: Int
      genres: [String]
      cover_type: CoverType
    }

    input BookOptions {
      limit: Int
      skip: Int
      sortField: String
      sortOrder: Int
    }

    type Query {
      findAll: [Book]
      findBookById(id: ID!): Book
      searchBooks(query: String!, options: BookOptions): [Book]
      filterBooks(filters: BookFilters!, options: BookOptions): [Book]
      isBookAvailable(id: ID!): Boolean
      myBooks: [Book]
    }

    type Mutation {
      addBook(input: AddBookInput!): Book!
      updateBook(id: ID!, input: UpdateBookInput!): Book
      deleteBook(id: ID!): String
    }
`;

export const resolvers = {
  Query: {
    findAll: async () => {
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
    searchBooks: async (_, { query, options }) => {
      const books = await Book.searchBooks(query, options);
      return books;
    },
    filterBooks: async (_, { filters, options }) => {
      const books = await Book.filterBooks(filters, options);
      return books;
    },
    isBookAvailable: async (_, { id }) => {
      const isAvailable = await Book.isBookAvailable(id);
      return isAvailable;
    },
    myBooks: requireAuth(async (_, __, { user }) => {
      // Find all books uploaded by the authenticated user
      return await Book.findBooksByUploaderId(user._id);
    }),
  },
  Mutation: {
    addBook: requireAuth(async (_, { input }, { user }) => {
      //ADD AUTH USER SEBAGAI USERID
      const bookData = {
        ...input,
        uploaded_by: user._id, // Pass the ObjectId directly
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newBook = await Book.addBook(bookData);

      return {
        _id: newBook._id.toString(),
        ...newBook,
        uploaded_by: newBook.uploaded_by.toString(),
      };
    }),
    updateBook: requireAuth(async (_, { id, input }, { user }) => {
      //cek yg auth user uploader bukan
      const book = await Book.findBookById(id);
      if (!book) throw new Error(`Book with ID ${id} not found`);

      if (book.uploaded_by.toString() !== user._id.toString()) {
        throw new Error("Not authorized to update this book");
      }

      const updatedBook = await Book.updateBook(id, input);
      return {
        _id: updatedBook._id.toString(),
        ...updatedBook,
        uploaded_by: updatedBook.uploaded_by.toString(),
      };
    }),
    deleteBook: requireAuth(async (_, { id }, { user }) => {
      //cek yg auth user uploader bukan
      const book = await Book.findBookById(id);
      if (!book) throw new Error(`Book with ID ${id} not found`);

      if (book.uploaded_by.toString() !== user._id.toString()) {
        throw new Error("Not authorized to delete this book");
      }

      await Book.deleteBook(id);
      return `Book with ID ${id} has been deleted`;
    }),
  },
  //resolver buat format uploaded_by
  Book: {
    uploaded_by: (book) => {
      return book.uploaded_by.toString();
    },
  },
};
