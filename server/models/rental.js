// import { ObjectId } from "mongodb";
// import { getDb } from "../config/mongodb.js";
// import midtransClient from "midtrans-client";
// // Create Core API instance
// let snap = new midtransClient.Snap({
//   isProduction: false,
//   clientKey: "SB-Mid-client-6pB9MZdWmznmSa-m",
//   serverKey: "SB-Mid-server-ij4VSUhBOPJK7xlq5-1pT4-z",
// });

// export default class Rental {
//   static getCollection() {
//     const db = getDb();
//     return db.collection("rentals");
//   }

//   static async findAll() {
//     return await this.getCollection().find().toArray();
//   }

//   static async findRentalById(id) {
//     return await this.getCollection().findOne({ _id: new ObjectId(id) });
//   }

//   static async findRentalsByUserId(userId) {
//     return await this.getCollection().find({ user_id: userId }).toArray();
//   }

//   static async createRental(data) {
//     const { user_id, total_amount, payment_method } = data;

//     if (!user_id) throw new Error("User ID is required");
//     if (typeof total_amount !== "number" || total_amount < 0) {
//       throw new Error("Total amount must be a positive number");
//     }

//     const newRental = {
//       user_id,
//       total_amount,
//       status: "pending", //default
//       payment_method: payment_method || "",
//       paid_date: null,
//       created_at: new Date(),
//       updated_at: new Date(),
//     };

//     const collection = this.getCollection();
//     const result = await collection.insertOne(newRental);

//     let parameter = {
//       transaction_details: {
//         order_id: result.insertedId.toString(),
//         gross_amount: total_amount,
//       },
//       //   credit_card: {
//       //     secure: true,
//       //   },
//     };
//     const transaction = await snap.createTransaction(parameter);
//     // console.log(transaction);
//     const rentalWithTrx = await this.getCollection().findOneAndUpdate(
//       { _id: result.insertedId },
//       {
//         $set: {
//           token: transaction.token,
//           redirect_url: transaction.redirect_url,
//         },
//       },
//       {
//         returnDocument: "after",
//       }
//     );
//     // console.log(rentalWithTrx);

//     return {
//       //   _id: result.insertedId,
//       ...rentalWithTrx,
//     };
//   }

//   static async updateRentalStatus(id, status, payment_method = null) {
//     if (!["pending", "completed", "failed"].includes(status)) {
//       throw new Error("Invalid status value");
//     }

//     const collection = this.getCollection();
//     const _id = new ObjectId(id);

//     const updateData = {
//       status,
//       updated_at: new Date(),
//     };

//     if (status === "completed") {
//       updateData.paid_date = new Date();
//       if (payment_method) {
//         updateData.payment_method = payment_method;
//       }
//     }

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
//       if (!fallback) throw new Error(`Rental with ID ${id} not found`);
//       return fallback;
//     }

//     return result.value;
//   }

//   static async deleteRental(id) {
//     const collection = this.getCollection();
//     const _id = new ObjectId(id);
//     const result = await collection.deleteOne({ _id });

//     if (result.deletedCount === 0) {
//       throw new Error(`Rental with ID ${id} not found`);
//     }
//   }
// }

import { ObjectId } from "mongodb";
import { getDb } from "../config/mongodb.js";
import midtransClient from "midtrans-client";
// TODO MIDTRANS - Import crypto for signature verification
import crypto from "crypto";
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

  // TODO MIDTRANS - Add Midtrans webhook handler method
  static async handleMidtransWebhook(data) {
    console.log("Midtrans webhook data:", data);

    try {
      // 1. Check if order ID exists in DB
      const orderId = data.order_id;
      const rental = await this.findRentalById(orderId);

      if (!rental) {
        console.error(`Rental with order ID ${orderId} not found`);
        return { success: false, message: "Order ID not found" };
      }

      // 2. Check if status is already completed - avoid duplicate processing
      if (rental.status === "completed") {
        console.log(`Payment for order ${orderId} already completed`);
        return { success: true, message: "Payment already processed" };
      }

      // 3. If status is pending, we can proceed
      if (rental.status !== "pending") {
        console.error(
          `Cannot process payment for order ${orderId} with status ${rental.status}`
        );
        return {
          success: false,
          message: `Invalid rental status: ${rental.status}`,
        };
      }

      // 4. Check if gross_amount matches the amount in DB
      const midtransAmount = parseFloat(data.gross_amount);
      if (midtransAmount !== rental.total_amount) {
        console.error(
          `Amount mismatch for order ${orderId}: Expected ${rental.total_amount}, got ${midtransAmount}`
        );
        return { success: false, message: "Amount mismatch" };
      }

      // 5. Check transaction status, only accept "capture" or "settlement"
      const validStatuses = ["capture", "settlement"];
      if (!validStatuses.includes(data.transaction_status)) {
        console.error(
          `Invalid transaction status for order ${orderId}: ${data.transaction_status}`
        );
        await this.updateRentalStatus(orderId, "failed", data.payment_type);
        return { success: false, message: "Invalid transaction status" };
      }

      // 6. Generate and verify signature key
      const serverKey = "SB-Mid-server-ij4VSUhBOPJK7xlq5-1pT4-z"; // Should be stored in env
      const signatureData = `${orderId}${data.status_code}${data.gross_amount}${serverKey}`;
      const expectedSignature = crypto
        .createHash("sha512")
        .update(signatureData)
        .digest("hex");

      if (data.signature_key !== expectedSignature) {
        console.error(`Signature key mismatch for order ${orderId}`);
        return { success: false, message: "Invalid signature" };
      }

      // 7. All checks passed, update rental status to COMPLETED
      await this.updateRentalStatus(orderId, "completed", data.payment_type);
      console.log(`Payment for order ${orderId} successfully completed`);

      return { success: true, message: "Payment processed successfully" };
    } catch (error) {
      console.error("Error processing Midtrans webhook:", error);
      return { success: false, message: error.message };
    }
  }
}
