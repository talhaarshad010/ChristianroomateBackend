const { object } = require("joi");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const CustomerChatSchema = new Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    message: {type:String},
    msgType: {type:String},
    msgRead: {type: Number},
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

module.exports = mongoose.model("CustomerChat", CustomerChatSchema);
