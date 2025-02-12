const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
/** 
 * @module OtpSchema 
 */

/**
 * @property {Object} userId - Id of the User module
 * @property {number} otp - The random numbers that generated for the user
 * @property {string} usedfor - Otp usedFor like to verify phone Number or forgot password etc.
 * @property {Date} created - Creation Date of the otp
 * @property {Date} expired - Expiration Date of the otp which is 15 minutes 
 * 
 */

 const OtpSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref:"user"},
    otp: {type: Number},
    phone: {type:String},
    email: {type:String},
    usedfor: {type: String},
    expired: {type: Date, default: Date.now, index: { expires: '15m' }},
  }, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = mongoose.model('Otp', OtpSchema);