const { object, required } = require("joi");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

/**
 * @module Customer_Schema
 */
/**
 * @property {string} name - name of the customer
 * @property {string} username - username of the customer
 * @property {string} email - Email of the customer
 * @property {string} password - Password of the customer
 * @property {string} phone - Phone of the customer
 * @property {string} code - code of the customer
 * @property {string} status - status of the customer
 * @property {string} country - status of the customer
 * @property {string} state - state of the customer
 * @property {string} image - image of the customer
 * @property {Boolean} isPhoneVerified - isPhoneVerified of the customer
 * @property {Boolean} isEmailVerified - isEmailVerified of the customer
 * @property {Boolean} agree_box - agree_box of the customer
 * @property {string} galleryImage - galleryImage of the customer
 * @property {string} device_type - device_type of the customer
 * @property {string} device_token - device_token of the customer
 * @property {string} occupaction - occupaction of the customer
 */

const CustomerSchema = new Schema(
  {
    name: { type: String },
    username: { type: String },
    email: { type: String },
    code: { type: String },
    phone: { type: String },
    country: { type: Schema.Types.ObjectId, ref: 'Country' },
    state: { type: String },
    password: { type: String, select: false },
    status: { type: String }, // VERIFIED || NOT-VERIFIED || BLOCKED
    agree_box: { type: Boolean, default: false },
    image: {
      type: Schema.Types.ObjectId,
      ref: 'Image',
      default: '303030303030303030303030',
    },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    autoRenewPlan: { type: Boolean, default: false },
    isPlanActive: { type: Boolean, default: false },
    galleryImage: { type: Array, ref: 'Image' },
    currentPlan: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    device_type: { type: String },
    device_token: { type: String },
    gender: { type: String, default: null },
    age: { type: String, default: null },
    occupation: { type: String, default: null },
    smoker: { type: Boolean, default: null },
    UserTypePreference: { type: String, default: null },
    pet: { type: String, default: null },
    enabled: { type: Boolean, default: true },
    visibility: { type: Boolean, default: true },
    advanceOrders: { type: Array },
    isDeleted: { type: Boolean, default: false },
    stripeSubsId: { type: String },
    oldStripeSubsId: { type: Array },
    activeOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);
