const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

/** 
 * @module Page_Schema 
 */

/**
 * @property {string} pageName - Page Name of the page
 * @property {string} pagePath - Page Path of the page
 * @property {Object} language - Language of the page
 */

 const PageSchema = new Schema({
	pageName: {
		type: String
	},
    pagePath: {
		type: String
	},
	language: {
		type: String
	},
	section: {
		
	},	
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
	}
});

module.exports = mongoose.model('Pages', PageSchema);
