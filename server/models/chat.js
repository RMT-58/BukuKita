// import { ObjectId } from "mongodb";
// import { getDb } from "../config/mongodb.js";

// export default class Chat {
//   static getCollection() {
//     const db = getDb();
//     return db.collection("chats");
//   }

//   static async findAll() {
//     return await this.getCollection().find().toArray();
//   }

//   static async findChatById(id) {
//     return await this.getCollection().findOne({ _id: new ObjectId(id) });
//   }

//   static async findChatsByRoomId(roomId) {
//     return await this.getCollection()
//       .find({ room_id: roomId })
//       .sort({ created_at: 1 })
//       .toArray();
//   }

//   static async findChatsBetweenUsers(senderId, receiverId) {
//     return await this.getCollection()
//       .find({
//         $or: [
//           { sender_id: senderId, receiver_id: receiverId },
//           { sender_id: receiverId, receiver_id: senderId },
//         ],
//       })
//       .sort({ created_at: 1 })
//       .toArray();
//   }

//   static async createChat(data) {
//     const { sender_id, receiver_id, message, room_id } = data;

//     // Basic validation
//     if (!sender_id) throw new Error("Sender ID is required");
//     if (!receiver_id) throw new Error("Receiver ID is required");
//     if (!message || typeof message !== "string") {
//       throw new Error("Message is required and must be a string");
//     }
//     if (!room_id) throw new Error("Room ID is required");

//     const newChat = {
//       sender_id,
//       receiver_id,
//       message,
//       room_id,
//       created_at: new Date(),
//       updated_at: new Date(),
//     };

//     const collection = this.getCollection();
//     const result = await collection.insertOne(newChat);
//     return {
//       _id: result.insertedId,
//       ...newChat,
//     };
//   }

//   static async updateChat(id, updateData) {
//     const collection = this.getCollection();
//     const _id = new ObjectId(id);

//     updateData.updated_at = new Date();

//     const result = await collection.findOneAndUpdate(
//       { _id },
//       { $set: updateData },
//       {
//         returnDocument: "after",
//         upsert: false,
//       }
//     );

//     if (!result.value) {
//       const fallback = await collection.findOne({ _id });
//       if (!fallback) throw new Error(`Chat with ID ${id} not found`);
//       return fallback;
//     }

//     return result.value;
//   }

//   static async deleteChat(id) {
//     const collection = this.getCollection();
//     const _id = new ObjectId(id);
//     const result = await collection.deleteOne({ _id });

//     if (result.deletedCount === 0) {
//       throw new Error(`Chat with ID ${id} not found`);
//     }
//   }
// }

import { ObjectId } from "mongodb";
import { getDb } from "../config/mongodb.js";

export default class Chat {
  static getCollection() {
    const db = getDb();
    return db.collection("chats");
  }

  static async findAll() {
    return await this.getCollection().find().toArray();
  }

  static async findChatById(id) {
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  }

  static async findChatsByRoomId(roomId) {
    return await this.getCollection()
      .find({ room_id: roomId })
      .sort({ created_at: 1 })
      .toArray();
  }

  static async findChatsBetweenUsers(senderId, receiverId) {
    return await this.getCollection()
      .find({
        $or: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId },
        ],
      })
      .sort({ created_at: 1 })
      .toArray();
  }

  static async createChat(data) {
    const { sender_id, receiver_id, message, room_id } = data;

    // Basic validation
    if (!sender_id) throw new Error("Sender ID is required");
    if (!receiver_id) throw new Error("Receiver ID is required");
    if (!message || typeof message !== "string") {
      throw new Error("Message is required and must be a string");
    }
    if (!room_id) throw new Error("Room ID is required");

    const newChat = {
      sender_id,
      receiver_id,
      message,
      room_id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const collection = this.getCollection();
    const result = await collection.insertOne(newChat);
    return {
      _id: result.insertedId,
      ...newChat,
    };
  }

  static async updateChat(id, updateData) {
    const collection = this.getCollection();
    const _id = new ObjectId(id);

    updateData.updated_at = new Date();

    const result = await collection.findOneAndUpdate(
      { _id },
      { $set: updateData },
      {
        returnDocument: "after",
      }
    );

    if (!result.value) {
      const fallback = await collection.findOne({ _id });
      if (!fallback) throw new Error(`Chat with ID ${id} not found`);
      return fallback;
    }

    return result.value;
  }

  static async deleteChat(id) {
    const collection = this.getCollection();
    const _id = new ObjectId(id);
    const result = await collection.deleteOne({ _id });

    if (result.deletedCount === 0) {
      throw new Error(`Chat with ID ${id} not found`);
    }
  }
}
