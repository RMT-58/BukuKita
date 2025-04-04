import { ObjectId } from "mongodb";
import { getDb } from "../config/mongodb.js";
import RentalDetail from "./rentalDetail.js"; // Import RentalDetail

export default class Book {
  static getCollection() {
    const db = getDb();
    return db.collection("books");
  }

  static async findAll(params = {}) {
    const collection = this.getCollection();
    const {
      query = "",
      filters = {},
      limit = 12,
      skip = 0,
      sort = { created_at: -1 },
    } = params;

    let queryObject = {};

    //SEARCH CONDITION kalau ada query
    if (query && query.trim() !== "") {
      queryObject.$or = [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
        { genres: { $regex: query, $options: "i" } },
      ];
    }

    //FILTER
    if (filters.status) {
      queryObject.status = filters.status;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      queryObject.price = {};

      if (filters.minPrice !== undefined) {
        queryObject.price.$gte = filters.minPrice;
      }

      if (filters.maxPrice !== undefined) {
        queryObject.price.$lte = filters.maxPrice;
      }
    }

    if (filters.genres && filters.genres.length > 0) {
      queryObject.genres = { $in: filters.genres };
    }

    if (filters.cover_type) {
      queryObject.cover_type = filters.cover_type;
    }

    // ! gaperlu deh males
    // if (filters.uploaded_by) {
    //   const uploaded_by =
    //     typeof filters.uploaded_by === "string" ? new ObjectId(filters.uploaded_by): filters.uploaded_by;
    //   queryObject.uploaded_by = uploaded_by;
    // }

    //sorting
    let sortOptions = sort;
    if (params.sortField) {
      sortOptions = { [params.sortField]: params.sortOrder || -1 };
    }

    //dah
    return await collection
      .find(queryObject)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray();
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
      thumbnail_url,
      image_urls,
      status,
      price,
      uploaded_by,
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
    if (!["isClosed", "forRent"].includes(status)) {
      throw new Error("Status must be either 'isClosed' or 'forRent'");
    }
    if (typeof price !== "number" || price < 0) {
      throw new Error("Price must be a positive number");
    }
    if (!uploaded_by) {
      throw new Error("uploaded_by is required");
    }

    // Convert uploaded_by to ObjectId if it's a string
    const uploaded_by_id =
      typeof uploaded_by === "string" ? new ObjectId(uploaded_by) : uploaded_by;

    const newBook = {
      title,
      author,
      genres,
      synopsis: synopsis || "",
      cover_type,
      condition,
      condition_details: condition_details || "",
      thumbnail_url: thumbnail_url || "",
      image_urls,
      status,
      price,
      uploaded_by: uploaded_by_id,
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

  //! update
  static async updateBook(id, updateData) {
    const collection = this.getCollection();
    const _id = new ObjectId(id);

    updateData.updated_at = new Date();

    const result = await collection.findOneAndUpdate(
      { _id },
      { $set: updateData },
      {
        returnDocument: "after",
        upsert: false,
      }
    );

    if (!result.value) {
      //fallback data soalnya gagal terus
      const fallback = await collection.findOne({ _id });
      if (!fallback)
        throw new Error(`Book with ID ${id} not found (post-update)`);
      return fallback;
    }

    return result.value;
  }

  static async deleteBook(id) {
    const collection = this.getCollection();
    const _id = new ObjectId(id);
    const result = await collection.deleteOne({ _id });

    if (result.deletedCount === 0) {
      throw new Error(`Book with ID ${id} not found`);
    }
  }

  // cek bukunya available ga (apa udh dipinjem)
  static async isBookAvailable(id) {
    const currentDate = new Date();
    const rentalDetails = await RentalDetail.findActiveRentalsByBookId(id);
    return rentalDetails.length === 0;
  }

  // Find books by uploader - now uses the consolidated findAll method
  static async findBooksByUploaderId(uploaderId) {
    return await this.findAll({
      filters: { uploaded_by: uploaderId },
    });
  }
}
