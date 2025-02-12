const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
/**
 * @module Testimonial_Schema
 */

const TestimonialSchema = new Schema(
  {
    
    text: { type: String },
    name: { type: String },
    place: { type: String },
    image:{ type: Schema.Types.ObjectId, ref: "Image"  },
    status:{type: Boolean},
    deleted:{type: Boolean}
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

module.exports = mongoose.model("Testimonial", TestimonialSchema);
