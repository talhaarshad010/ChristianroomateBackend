const { object } = require("joi");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

/**
 * @module Bookmark_Schema
 */
/**
 * @property {string} property - property ref
 * @property {string} user - user ref 
 * @property {boolean} status - status of the customer
 */

const BookmarkSchema = new Schema(
  {
    user:{type: Schema.Types.ObjectId, ref: "Customer",default:null},
    property: {type: Schema.Types.ObjectId, ref: "Property"},
    tenant: {type: Schema.Types.ObjectId, ref: "Tenant",default:null},
    status: { type: Boolean },//true=active,false=deactive
    deleted: {type: Boolean},//true=deleted
    type: {type: Number},//0=property,1=tenant
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

module.exports = mongoose.model("Bookmark", BookmarkSchema);
