const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
/**
 * @module Image_Schema
 */
/**
 * @property {String} name - name of the image
 * @property {String} size - size of the image
 * @property {String} type - type of the image
 * @property {String} encoding - encoding of the image
 * @property {String} userId - user id of image
 * @property {String} path - path where image is saved
 */
const ImageSchema = new Schema(
  {
    name: { type: String },
    size: { type: String },
    type: { type: String },
    encoding: { type: String },
    path: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

module.exports = mongoose.model("Image", ImageSchema);
