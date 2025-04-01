import { ObjectId } from "mongodb";
import { getDb } from "../config/mongodb.js";

export default class Book {
  static getCollection() {
    const db = getDb();
    return db.collection("books");
  }

  static async findAll() {
    const collection = this.getCollection();
    return await collection.find().toArray();
  }

  static async findBookById(id) {
    const collection = this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  static async addBook(bookData) {
    const {
      title,
      author,
      genres,
      synopsis,
      cover_type,
      condition,
      condition_details,
      //   thumbnail_url,
      //   image_urls,
      status,
      price,
      //   uploaded_by,
    } = bookData;

    // validasi basic
    if (!title || typeof title !== "string")
      throw new Error("Title is required");
    if (!author || typeof author !== "string")
      throw new Error("Author is required");
    if (!Array.isArray(genres) || genres.some((g) => typeof g !== "string")) {
      throw new Error("Genres must be an array of strings");
    }
    if (!["hardcover", "paperback"].includes(cover_type)) {
      throw new Error("Cover type must be either 'hardcover' or 'paperback'");
    }
    if (typeof condition !== "number" || condition < 0 || condition > 10) {
      throw new Error("Condition must be a number between 0 and 10");
    }
    // if (
    //   !Array.isArray(image_urls) ||
    //   image_urls.some((u) => typeof u !== "string")
    // ) {
    //   throw new Error("Image URLs must be an array of strings");
    // }
    if (!["isClosed", "forRent"].includes(status)) {
      throw new Error("Status must be either 'isClosed' or 'forRent'");
    }
    if (typeof price !== "number" || price < 0) {
      throw new Error("Price must be a positive number");
    }
    // if (!uploaded_by || typeof uploaded_by !== "number") {
    //   throw new Error("uploaded_by must be a user ID (number)");
    // }

    const newBook = {
      title,
      author,
      genres,
      synopsis: synopsis || "",
      cover_type,
      condition,
      condition_details: condition_details || "",
      //   thumbnail_url: thumbnail_url || "",
      //   image_urls,
      status,
      price,
      //   uploaded_by,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const collection = this.getCollection();
    const result = await collection.insertOne(newBook);
    return {
      _id: result.insertedId,
      ...newBook,
    };
  }
}
