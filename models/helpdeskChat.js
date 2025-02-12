const { object } = require("joi");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

/**
 * @module ChatSchema
 */
/**
 * @property {string} userId - Id of the customer
 * @property {string} ticketId - ticketId
 * @property {string} message - customer-admin message over ticket chat
 */

const ChatSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
  },
  response: {type:String},
  adminId :{
      type: Schema.Types.ObjectId,
      ref: 'Admin'
   },
   ticketId:{
      type: Schema.Types.ObjectId,
      ref: 'Tickets'
   },
   image : {
      type: Schema.Types.ObjectId,
      ref: 'Image'
   }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

module.exports = mongoose.model("HelpDeskChat", ChatSchema);
