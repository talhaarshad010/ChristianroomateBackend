const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
/**
 * @module ContactUs_Schema
 */

const ContactUsSchema = new Schema(
  {
    name:{type:String},
    code: {type: String},
    email: { type: String },
    phone: { type: String },
    message: { type: String},
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

module.exports = mongoose.model("ContactUs", ContactUsSchema);
