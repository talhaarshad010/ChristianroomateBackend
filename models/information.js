const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
/** 
 * @module Information_Schema 
 */
/**
 * @property {string} heading - Heading of the Page
 * @property {string} description - Description of the Page
 * @property {string} key - key of page
 * @property {string} section - Section of the page
 * @property {number} numberValue - Number Value of the page
 */
 const Information_Schema = new Schema({
    heading: String,
    description: String,
    key: String,
    section: String,
    
    numberValue: { type:Number, default: 0  },    
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
    }
});


module.exports = mongoose.model('Information', Information_Schema);
