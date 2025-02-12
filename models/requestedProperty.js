const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

/**
 * @module Property_Schema
**/

const PropertySchema = new Schema(
  {
    user:{type: Schema.Types.ObjectId, ref: "Customer"},
    location:{type:String},
    coordinates:{
      lat:{type:String},
      lng:{type:String}
    },
    budget:{type:Number},
    occupants:{ type:String},
    house_type:{type:String},
    space_type:{type:String},
    lease_term:{type:String},
    furnishing:{type:String},
    range:{type:String},
    pets:{type:String},
    smoker:{type:String},
    foodPreference:{type:String},
    available_date:{type:Date},
    help_offered:{type:String},
    gender:{type:String},
    deleted:{type: Boolean}
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

module.exports = mongoose.model("requestedProperty", PropertySchema);
