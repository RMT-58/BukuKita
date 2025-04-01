import { getDb } from "../config/mongodb";

export default class Book {
  static getCollection() {
    const db = getDb();
    const collection = db.collection("books");
    return collection;
  }

  static async findAll() {
    const collection = this.getCollection();

    const books = await collection.find().toArray();
    return books;
  }
}
