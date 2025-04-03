import { ObjectId } from "mongodb";
import { getDb } from "../config/mongodb.js";

export default class Room {
  static getCollection() {
    const db = getDb();
    return db.collection("rooms");
  }

  static async findAll() {
    return await this.getCollection().find().toArray();
  }

  static async findRoomById(id) {
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  }

  static async findRoomsByUserId(userId) {
    return await this.getCollection().find({ user_id: userId }).toArray();
  }

  static async createRoom(data) {
    const { user_id } = data;

    if (!user_id) throw new Error("User ID is required");

    const newRoom = {
      user_id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const collection = this.getCollection();
    const result = await collection.insertOne(newRoom);
    return {
      _id: result.insertedId,
      ...newRoom,
    };
  }

  static async updateRoom(id, updateData) {
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
      const fallback = await collection.findOne({ _id });
      if (!fallback) throw new Error(`Room with ID ${id} not found`);
      return fallback;
    }

    return result.value;
  }

  static async deleteRoom(id) {
    const collection = this.getCollection();
    const _id = new ObjectId(id);
    const result = await collection.deleteOne({ _id });

    if (result.deletedCount === 0) {
      throw new Error(`Room with ID ${id} not found`);
    }
  }
}
