import { ObjectId } from "mongodb";
import { getDb } from "../config/mongodb.js";
import midtransClient from "midtrans-client";
// Create Core API instance
let snap = new midtransClient.Snap({
  isProduction: false,
  clientKey: "SB-Mid-client-6pB9MZdWmznmSa-m",
  serverKey: "SB-Mid-server-ij4VSUhBOPJK7xlq5-1pT4-z",
});

export default class Rental {
  static getCollection() {
    const db = getDb();
    return db.collection("rentals");
  }

  static async findAll() {
    return await this.getCollection().find().toArray();
  }

  static async findRentalById(id) {
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  }

  static async findRentalsByUserId(userId) {
    return await this.getCollection().find({ user_id: userId }).toArray();
  }

  static async createRental(data) {
    const { user_id, total_amount, payment_method } = data;

    if (!user_id) throw new Error("User ID is required");
    if (typeof total_amount !== "number" || total_amount < 0) {
      throw new Error("Total amount must be a positive number");
    }

    const newRental = {
      user_id,
      total_amount,
      status: "pending", //default
      payment_method: payment_method || "",
      paid_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const collection = this.getCollection();
    const result = await collection.insertOne(newRental);

    let parameter = {
      transaction_details: {
        order_id: result.insertedId.toString(),
        gross_amount: total_amount,
      },
      //   credit_card: {
      //     secure: true,
      //   },
    };
    const transaction = await snap.createTransaction(parameter);
    // console.log(transaction);
    const rentalWithTrx = await this.getCollection().findOneAndUpdate(
      { _id: result.insertedId },
      {
        $set: {
          token: transaction.token,
          redirect_url: transaction.redirect_url,
        },
      },
      {
        returnDocument: "after",
      }
    );
    // console.log(rentalWithTrx);

    return {
      //   _id: result.insertedId,
      ...rentalWithTrx,
    };
  }

  static async updateRentalStatus(id, status, payment_method = null) {
    if (!["pending", "completed", "failed"].includes(status)) {
      throw new Error("Invalid status value");
    }

    const collection = this.getCollection();
    const _id = new ObjectId(id);

    const updateData = {
      status,
      updated_at: new Date(),
    };

    if (status === "completed") {
      updateData.paid_date = new Date();
      if (payment_method) {
        updateData.payment_method = payment_method;
      }
    }

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
      if (!fallback) throw new Error(`Rental with ID ${id} not found`);
      return fallback;
    }

    return result.value;
  }

  static async deleteRental(id) {
    const collection = this.getCollection();
    const _id = new ObjectId(id);
    const result = await collection.deleteOne({ _id });

    if (result.deletedCount === 0) {
      throw new Error(`Rental with ID ${id} not found`);
    }
  }
}
