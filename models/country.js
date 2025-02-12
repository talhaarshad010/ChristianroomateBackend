const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
/**
 * @module Country_Schema
 */
/**
 * @property {string} countryName - name of the Country
 * @property {string} description - mobile code of the Country
 */
const CountrySchema = new Schema({
  countryName: String,
  countryCode: String,
  mobileCode: String,
  isAllowed: {type: Boolean, default: false},
  states: Array,
});

module.exports = mongoose.model("Country", CountrySchema);
