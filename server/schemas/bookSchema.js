import Book from "../models/book.js";
import User from "../models/user.js";
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
      uploader_id: ID!
      uploaded_by: User
      created_at: String!
      updated_at: String!
    }

    type PaginationInfo {
      totalCount: Int!
      totalPages: Int!
      currentPage: Int!
      limit: Int!
    }

    type BookPaginationResult {
      data: [Book!]!
      pagination: PaginationInfo!
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
      findAll(query: String, filters: BookFilters, options: BookOptions): BookPaginationResult!
      findBookById(id: ID!): Book
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
    findAll: async (_, { query, filters, options }) => {
      // Call the consolidated findAll method with all parameters
      return await Book.findAll({
        query,
        filters,
        ...(options || {}),
      });
    },
    findBookById: async (_, { id }) => {
      const book = await Book.findBookById(id);
      if (!book) {
        throw new Error(`Book with ID ${id} not found`);
      }
      return book;
    },
    isBookAvailable: async (_, { id }) => {
      return await Book.isBookAvailable(id);
    },
    myBooks: requireAuth(async (_, __, { user }) => {
      const result = await Book.findAll({
        filters: { uploaded_by: user._id },
      });
      return result.data;
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
    //uplaoder idnya harus string terus
    uploader_id: (book) => {
      return typeof book.uploaded_by === "object"
        ? book.uploaded_by.toString()
        : book.uploaded_by;
    },
    uploaded_by: async (book) => {
      try {
        //objectId convert to string
        const userId =
          typeof book.uploaded_by === "object"
            ? book.uploaded_by.toString()
            : book.uploaded_by;

        //GET user info
        const user = await User.findUserById(userId);

        if (!user) {
          console.warn(`User with ID ${userId} not found for book ${book._id}`);
          return null;
        }

        return {
          _id: user._id.toString(),
          name: user.name,
          username: user.username,
          phone_number: user.phone_number || "",
          address: user.address || "",
        };
      } catch (error) {
        console.error(`Error fetching user for book ${book._id}:`, error);
        return null;
      }
    },
  },
};
