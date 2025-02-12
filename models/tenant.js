const { SafeString } = require("handlebars");
const { object, string, boolean } = require("joi");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

/**
 * @module Tenant_Schema
 */
/**
 *
 */

const TenantSchema = new Schema(
  {
    user:{type: Schema.Types.ObjectId, ref: "Customer"},
    username: {type: String},
    location: { 
      type: {
          type: String,
          enum: ["Point"],
          default: "Point",
      } ,
      coordinates: { 
          type: [Number], required: true 
      },
  },
  address:{type:String},
    // location:{type:String},
    // coordinates:{
    //   lat:{type:String},
    //   lng:{type:String}
    // },
    budget:{type:Number},
    age:{type:Number},
    available_date:{type:Date},
    household_occupants:{type:String},
    house_type:{type:String},
    space_type:{type:String},
    lease_term:{type:String},
    furnishing:{type:String},
    help_offered:{type:String},
    gender:{type:String},
    pets:{type:String},
    smoker:{type:String},
    status:{type:Boolean,default:true},
    deleted: {type: Boolean,default:false},//true=deleted
    isbookMark: {type: Boolean,default:false},//true=bookmarked
    bookmarkId:{type:String,default:null},//mapping with bookmark collection
    userDeleted: {type: Boolean, default: false},
    moderationStatus: {type:Boolean, default: true},
    visibility: {type:Boolean, default: true}
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
TenantSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Tenant", TenantSchema);
