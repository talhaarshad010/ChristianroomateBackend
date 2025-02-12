const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
/**
 * @module Order_Schema
 */

const OrderSchema = new Schema(
  {
    orderId: { type: String },
    invoiceNumber: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "Customer" },
    currency: { type: String, default: "USD" },
    plan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    status: { type: String }, //Draft,Pending,Paid,Cancel
    paymentDetails: {}, //  should be invoice
    stripeSessionid: { type: String },
    isMarkedForCancellation: { type: Boolean, default: false },
    activationDate: { type: Date }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

module.exports = mongoose.model("Order", OrderSchema);
