import { ObjectId } from "mongodb";
import { getDb } from "../config/mongodb.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/auth.js";

export default class User {
  static getCollection() {
    const db = getDb();
    return db.collection("users");
  }

  static async findAll() {
    return await this.getCollection().find().toArray();
  }

  static async findUserById(id) {
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  }

  static async findUserByUsername(username) {
    return await this.getCollection().findOne({ username });
  }

  static async register(data) {
    const collection = this.getCollection();
    const { name, username, password, phone_number, address } = data;

    if (!username || !password)
      throw new Error("Username and password are required");

    const existing = await collection.findOne({ username });
    if (existing) throw new Error("Username already taken");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      username,
      password: hashedPassword,
      phone_number: phone_number || "",
      address: address || "",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await collection.insertOne(newUser);
    const user = { _id: result.insertedId, ...newUser };

    //GENERATE TOKEN
    const token = generateToken(user);

    return {
      token,
      user,
    };
  }

  static async login({ username, password }) {
    const collection = this.getCollection();

    const user = await collection.findOne({ username });
    if (!user) throw new Error("Invalid username or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid username or password");

    const token = generateToken(user);

    return {
      token,
      user,
    };
  }

  static async updateUser(id, updateData) {
    const collection = this.getCollection();
    const _id = new ObjectId(id);

    //biar gabisa edit pass disini
    if (updateData.password) {
      delete updateData.password;
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
      if (!fallback) throw new Error(`User with ID ${id} not found`);
      return fallback;
    }

    return result.value;
  }

  static async updatePassword(id, currentPassword, newPassword) {
    const collection = this.getCollection();
    const _id = new ObjectId(id);

    const user = await this.findUserById(id);
    if (!user) throw new Error(`User with ID ${id} not found`);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error("Current password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await collection.findOneAndUpdate(
      { _id },
      {
        $set: {
          password: hashedPassword,
          updated_at: new Date(),
        },
      },
      {
        returnDocument: "after",
        upsert: false,
      }
    );

    return result.value;
  }

  static async deleteUser(id) {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
  }
}
