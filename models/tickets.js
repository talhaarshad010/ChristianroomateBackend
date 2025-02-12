const { object } = require("joi");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

/**
 * @module Tickets_Schema
 */
/**
 * @property {string} subject - name of the customer
 * @property {string} issue - username of the custome
 * @property {boolean} status - status of the customer
 */

const TicketsSchema = new Schema(
  {
    user:{type: Schema.Types.ObjectId, ref: "Customer"},
    subject: { type: String },
    issue: { type: String },
    status: { type: Boolean },//true=active,false=deactive
    deleted: {type: Boolean},//true=deleted
    ticketNumber :{ type:String},
    requestResolvedOn : {type:Date},
    issueDuration : { type:Number} , // In days
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

module.exports = mongoose.model("Tickets", TicketsSchema);
