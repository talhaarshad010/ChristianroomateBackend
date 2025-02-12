const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
/** 
 * @module Amenitie_Schema 
 */
/**
 * @property {string} name - name of the Page
 * @property {string} description - Description of the Page
 */
 const Amenitie_Schema = new Schema({
    name: String,
    description: String,
    status: {type:Boolean, default: true}   
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
    }
});


module.exports = mongoose.model('Amenitie', Amenitie_Schema);
