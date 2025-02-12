const { SafeString } = require("handlebars");
const { object } = require("joi");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

/**
 * @module Property_Schema
 */
/**
 *
 * @property {string} user - user ref
 * @property {boolean} status - status of the customer
 */

const PropertySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Customer" },
    status: { type: Boolean, default: true },
    images: { type: Array, ref: "Image", default: "313131313131313131313131" },
    rent: { type: Number },
    payable: { type: String },
    title: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: { type: String },
    available_date: { type: Date },
    lease_term: { type: String },
    house_type: { type: String },
    space_type: { type: String },
    furnishing: { type: String },
    amenties: { type: Array, ref: "Amenitie" },
    range: { type: String },
    age_start_range: { type: Number },
    age_end_range: { type: Number },
    gender: { type: String },
    occupation: { type: String },
    pets: { type: String },
    smoker: { type: String },
    guest_range: { type: String },
    guest_age_start_range: { type: Number },
    guest_age_end_range: { type: Number },
    guest_gender: { type: String },
    guest_occupation: { type: String },
    guest_pets: { type: String },
    guest_smoker: { type: String },
    description: { type: String },
    service_wanted: { type: String },
    help_offered: { type: String },
    life_stage: { type: String },
    relation_status: { type: String },
    deleted: { type: Boolean }, //true=deleted
    isbookMark: { type: Boolean, default: false }, //true=favorate
    bookmarkId: { type: String, default: null }, //mapping with bookmark collection
    userDeleted: { type: Boolean, default: false },
    moderationStatus: { type: Boolean, default: true },
    visibility: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
PropertySchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Property", PropertySchema);
