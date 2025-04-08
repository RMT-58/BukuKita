import { ObjectId } from "mongodb";
import { getDb } from "../config/mongodb.js";

export default class RentalDetail {
  static getCollection() {
    const db = getDb();
    return db.collection("rentalDetails");
  }

  static async findAll() {
    return await this.getCollection().find().toArray();
  }

  static async findDetailById(id) {
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  }

  static async findDetailsByRentalId(rentalId) {
    return await this.getCollection()
      .find({
        rental_id: new ObjectId(rentalId),
      })
      .toArray();
  }

  static async findActiveRentalsByBookId(bookId) {
    const currentDate = new Date();
    return await this.getCollection()
      .find({
        book_id: new ObjectId(bookId),
        rental_end: { $gte: currentDate },
      })
      .toArray();
  }

  static async createRentalDetail(data) {
    const {
      book_id,
      price,
      period,
      title,
      author,
      genres,
      synopsis,
      cover_type,
      thumbnail_url,
      image_urls,
      rental_id,
      rental_start,
      rental_end,
    } = data;

    //validation
    if (!book_id) throw new Error("Book ID is required");
    if (!rental_id) throw new Error("Rental ID is required");
    if (typeof price !== "number" || price < 0) {
      throw new Error("Price must be a positive number");
    }
    if (typeof period !== "number" || period <= 0) {
      throw new Error("Period must be a positive number");
    }

    // total HARGA
    const total = price * period;

    //biar tanggal bagus (parse)
    const startDate = rental_start ? new Date(rental_start) : new Date();
    const endDate = rental_end ? new Date(rental_end) : new Date();

    //validasi tanggal
    if (endDate <= startDate) {
      throw new Error("Rental end date must be after start date");
    }

    const newRentalDetail = {
      book_id: new ObjectId(book_id),
      price,
      period,
      total,
      title,
      author,
      genres,
      synopsis: synopsis || "",
      cover_type,
      thumbnail_url: thumbnail_url || "",
      image_urls,
      rental_id: new ObjectId(rental_id),
      rental_start: startDate,
      rental_end: endDate,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const collection = this.getCollection();
    const result = await collection.insertOne(newRentalDetail);
    return {
      _id: result.insertedId,
      ...newRentalDetail,
    };
  }

  static async updateRentalDetail(id, updateData) {
    const collection = this.getCollection();
    const _id = new ObjectId(id);

    //kalau period atau price diupdate, recalculate total
    if (
      (updateData.period && typeof updateData.period === "number") ||
      (updateData.price && typeof updateData.price === "number")
    ) {
      const detail = await this.findDetailById(id);
      if (!detail) throw new Error(`Rental detail with ID ${id} not found`);

      const price = updateData.price || detail.price;
      const period = updateData.period || detail.period;
      updateData.total = price * period;
    }

    //update dates
    if (updateData.rental_start) {
      updateData.rental_start = new Date(updateData.rental_start);
    }
    if (updateData.rental_end) {
      updateData.rental_end = new Date(updateData.rental_end);
    }

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
      const fallback = await collection.findOne({ _id });
      if (!fallback)
        throw new Error(`Rental detail with ID ${id} not found (post-update)`);
      return fallback;
    }

    return result.value;
  }

  static async deleteRentalDetail(id) {
    const collection = this.getCollection();
    const _id = new ObjectId(id);
    const result = await collection.deleteOne({ _id });

    if (result.deletedCount === 0) {
      throw new Error(`Rental detail with ID ${id} not found`);
    }
  }
}
