const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

/**
 * @module SubscriptionPlan_Schema
 */

/**
 * @property {string} title - Title of the Subscription
 * @property {string} days - For how many days the Subscription is active
 * @property {number} price - Price of the Subription
 * @property {string} planType - Type of the Subscription Plan
 * @property {number} priceAfterDiscount - Price after deducting the discount
 * @property {string} discountType - Discount type of the Subscription
 * @property {number} discount- Discount for the Subscription
 * @property {string} oneTimePlan - Type of the OneTime Plan
 * @property {string} status - Status of the Subscription
 */

const SubscriptionPlanSchema = new Schema(
  {
    title: {
      type: String,
    },
    days: {
      type: Number,
    },
    price: {
      type: Number,
    },
    planType: { type: String }, // Weekly | Monthly | Quarterly | Annually; if any
    priceAfterDiscount: { type: Number },
    discountType: { type: String }, // Flat | Percentage
    discount: { type: Number }, // in percentage if discountType = percentage
    oneTimePlan: { type: Boolean }, // if it's a one time plan then get true otherwise, false
    status: { type: String }, // ACTIVE | INACTIVE
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

module.exports = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
