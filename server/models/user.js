import { ObjectId } from "mongodb";
import { getDb } from "../config/mongodb.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "rahasia";

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
    const token = jwt.sign(
      { _id: user._id, username: user.username },
      SECRET_KEY
    );

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

    const token = jwt.sign(
      { _id: user._id, username: user.username },
      SECRET_KEY
    );

    return {
      token,
      user,
    };
  }

  static async deleteUser(id) {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
  }
}
