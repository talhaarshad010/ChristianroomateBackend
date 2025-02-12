const { string } = require("joi");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

/**
 * @module subsHistory_Schema
 */

/**
 * @property {string} pageName - Page Name of the page
 * @property {string} pagePath - Page Path of the page
 * @property {Object} language - Language of the page
 */

const subsHistory_Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Customer" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    status: { type: String },
    plan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    from: { type: Date },
    to: { type: Date },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

module.exports = mongoose.model("SubsHistory", subsHistory_Schema);
